// fork: https://github.com/lethern/bitpacker
// original: https://github.com/davidsiems/bitpacker

export default {
	ListBitpacks,
	LoadManifest,
	BitpackAdd,
}

const baseLiveURL = 'https://us-central1-bit-packer.cloudfunctions.net';
const DownloadPackageURL = `${baseLiveURL}/DownloadPackage`;

async function ListBitpacks() {
	let downloadResultOp = new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		let apiKey = 'AIzaSyAdqErjegWi8CFRMfrCFNn6Wf9GmR1kBl0';
		let url = `https://firestore.googleapis.com/v1/projects/bit-packer/databases/(default)/documents/bitpack-registry?key=${apiKey}`;
		xhr.onreadystatechange = function () {
			if (xhr.readyState != XMLHttpRequest.DONE) return;

			try {
				let responseJson = JSON.parse(xhr.responseText);
				if (responseJson.error) {
					reject(responseJson.error);
				}
				else {
					let docs = [];
					for (let docIndex in responseJson.documents) {
						let doc = responseJson.documents[docIndex];
						docs.push(ConvertFirestoreObject(doc.fields));
					}
					resolve(docs);
				}
			}
			catch (syntaxError) {
				reject(syntaxError);
			}
		};
		xhr.onerror = (e) => {
			reject(e);
		};
		xhr.open('GET', url, true);
		xhr.send(null);
	});

	return await downloadResultOp;
}

function ConvertFirestoreObject(json) {
	const prop = GetFirestoreProperty(json);
	if (prop === 'doubleValue' || prop === 'integerValue') {
		json = Number(json[prop]);
	}
	else if (prop === 'arrayValue') {
		json = ((json[prop] && json[prop].values) || []).map((v) => ConvertFirestoreObject(v));
	}
	else if (prop === 'mapValue') {
		json = ConvertFirestoreObject((json[prop] && json[prop].fields) || {});
	}
	else if (prop === 'geoPointValue') {
		json = {
			latitude: 0, longitude: 0,
			...json[prop]
		};
	}
	else if (prop) {
		json = json[prop];
	}
	else if (typeof json === 'object') {
		Object.keys(json).forEach((k) => (json[k] = ConvertFirestoreObject(json[k])));
	}
	return json;
}

function GetFirestoreProperty(value) {
	const props = {
		arrayValue: true,
		bytesValue: true,
		booleanValue: true,
		doubleValue: true,
		geoPointValue: true,
		integerValue: true,
		mapValue: true,
		nullValue: true,
		referenceValue: true,
		stringValue: true,
		timestampValue: true
	};
	return Object.keys(value).find((k) => props[k]);
}

/** @param {import('/os/plugins/api_adapter.js').OS_API} os */
async function LoadManifest(os) {
	try {
		const path = 'packages.txt';
		let manifestJSON = await os.getNS(ns => ns.read(path));

		if (!manifestJSON || !manifestJSON.length) return; // throw "Missing or empty file " + path;
		let manifest = JSON.parse(manifestJSON);
		return manifest;
	}
	catch (syntaxError) {
		throw "Couldn't parse packages.txt: "+syntaxError.message;
	}
}

/** @param {import('/os/plugins/api_adapter.js').OS_API} os */
async function BitpackAdd(os, options, bitpack, version) {
	if (!version)
		version = 'latest';
	let manifest = await LoadManifest(os);

	if (manifest === undefined)
		manifest = await CreateManifest(os);

	let existing = manifest.bitpacks[bitpack];

	if ((existing && existing !== version) || !existing) {
		let metadata = await DownloadBitpack(os, options, bitpack, version);
		if (!metadata) {
			return false;
		}
		else {
			manifest.bitpacks[bitpack] = `${metadata.version}`;
			await SaveManifest(os, manifest);
		}
	}
	return true;
}

/** @param {import('/os/plugins/api_adapter.js').OS_API} os */
async function CreateManifest(os) {
	let manifest = {
		bitpacks: {}
	};
	await SaveManifest(os, manifest);
	return manifest;
}

/** @param {import('/os/plugins/api_adapter.js').OS_API} os */
async function SaveManifest(os, manifest) {
	let manifestJSON = JSON.stringify(manifest, undefined, 4);
	await os.getNS(ns => ns.write('packages.txt', manifestJSON, 'w'));
}

/** @param {import('/os/plugins/api_adapter.js').OS_API} os */
async function DownloadBitpack(os, options, bitpack, version) {
	let request = {
		bitpack: bitpack,
		version: version
	};

	let downloadResultOp = new Promise((resolve, reject) => {
		let xhr = new XMLHttpRequest();
		xhr.setRequestHeader('Content-Type', 'application/json');

		xhr.onreadystatechange = function () {
			if (xhr.readyState == XMLHttpRequest.DONE) {
				try {
					let responseJson = JSON.parse(xhr.responseText);
					if (responseJson.error) {
						reject(responseJson.error);
					}
					else {
						resolve(responseJson.bitpack);
					}
				}
				catch (syntaxError) {
					reject(syntaxError);
				}
			}
		};
		xhr.onerror = (e) => {
			reject(e);
		};
		xhr.open('POST', DownloadPackageURL, true);
		xhr.send(JSON.stringify(request));
	});

	let payload = await downloadResultOp;
	if (!payload) {
		throw `Failed to download ${bitpack}:${version}`;
	}
	DeleteBitpack(os, options, bitpack);

	for (let filename in payload.files) {
		await os.getNS(ns => ns.write(`/bitpacks/${bitpack}/${filename}`, payload.files[filename], 'w'));
	}
	//Print(ns, options, `Bitpack installed ${bitpack}:${payload.metadata.version}`);
	return payload.metadata;
}

/** @param {import('/os/plugins/api_adapter.js').OS_API} os */
async function DeleteBitpack(os, options, bitpack) {
	await os.getNS(ns => {
		let files = ns.ls(ns.getHostname(), `/bitpacks/${bitpack}`)
		for (let file of files) {
			if (!file.startsWith(`/bitpacks/${bitpack}`))
				continue;
			ns.rm(file);
		}
	});
}
