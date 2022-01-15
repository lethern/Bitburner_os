// fork: https://github.com/lethern/bitpacker
// original: https://github.com/davidsiems/bitpacker

export async function listBitpacks() {
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
		// result.sort((a, b) => {
		// 	if (a.uniqueName < b.uniqueName) {
		// 		return -1;
		// 	}
		// 	if (a.uniqueName > b.uniqueName) {
		// 		return 1;
		// 	}
		// 	return 0;
		// });
		// let output = 'Packages in the bitpack registry:\n';
		// for (let entry of result) {
		// 	output += `    ${entry.uniqueName}: ${entry.shortDescription}\n`;
		// }
		// Print(ns, options, output);
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
export async function loadManifest(os) {
	try {
		const path = 'packages.txt';
		let manifestJSON = await os.getNS(ns => ns.read(path));

		if (!manifestJSON || !manifestJSON.length) throw "Missing or empty file " + path;
		let manifest = JSON.parse(manifestJSON);
		return manifest;
	}
	catch (syntaxError) {
		throw "Couldn't parse packages.txt: "+syntaxError.message;
	}
}