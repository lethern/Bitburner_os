# Bitburner_os
A collection of graphical tools and widgets, with a few additions that allow to expand it, like NS queue and plugin manager. If you want to help, check out the `#projects-talk` channel on the Bitburner discord!

To install, simply download and run `install.js`

* Network explorer: double click icon to connect to a server
* Files explorer: double click to open directory or open (nano) a file
* Plugins Manager - allows using different plugins (currently preinstalled: attacks monitor, network graph, REPL) 

For Process List and RGraph plugins to work, you need to create config file:
`nano /os/plugins/process-list/process-list.config.js`
`nano /os/plugins/rgraph/process-list.config.js`
The sample for config can be found e.g in `/os/plugins/process-list/process-list.config.example.js`
