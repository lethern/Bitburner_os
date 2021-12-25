# Bitburner_os
A graphical os for Bitrunner. Quite a few features planned, currently just a file explorer. If you want to help, check out the HTML injection and Gui thread on the discord!

To install, simply make a new script and copy the following into it:

```js
export async function main(ns) {
	ns.kill('install.js','home')
	ns.rm('install.js')
	await ns.sleep(500)
    await ns.wget('https://raw.githubusercontent.com/lethern/Bitburner_os/main/install.js','install.js')
	ns.run('install.js')
}
```

Run the new script, and the OS should download. 
