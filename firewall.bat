netsh advfirewall firewall add rule name="CouchDB/HTTP"  dir=in action=allow protocol=TCP localport=5984
netsh advfirewall firewall add rule name="DevServer"  dir=in action=allow protocol=TCP localport=3000
netsh interface portproxy add v4tov4 listenaddress=192.168.43.95 listenport=7984 connectaddress=127.0.0.1 connectport=5984
netsh advfirewall firewall add rule name="DevServer"  dir=in action=allow protocol=TCP localport=4000
netsh interface portproxy add v4tov4 listenaddress=192.168.43.95 listenport=4000 connectaddress=127.0.0.1 connectport=3000