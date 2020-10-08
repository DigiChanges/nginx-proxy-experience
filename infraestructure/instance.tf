
resource "digitalocean_droplet" "proxy" {
  image  = var.IMAGE
  name   = var.NAME
  region = var.REGION
  size   = var.SIZE
  ssh_keys =[var.FINGERPRINT]

  connection {
        host = self.ipv4_address
        user = "root"
        type = "ssh"
        private_key = file(var.PATH_TO_PRIVATE_KEY)
        timeout = "2m"
  }

  provisioner "file" {
    source      = "script.sh"
    destination = "/tmp/script.sh"
  }

  provisioner "file" {
    source = "id_rsa"
    destination = "/tmp/id_rsa"
  }

  provisioner "file" {
    source = "id_rsa.pub"
    destination = "/tmp/id_rsa.pub"
  }

  provisioner "file" {
    source = "../nginx.http.reverse.proxy.conf"
    destination = "/tmp/nginx.http.reverse.proxy.conf"
  }

  provisioner "file" {
    source = "../nginx.https.reverse.proxy.conf"
    destination = "/tmp/nginx.https.reverse.proxy.conf"
  }

  provisioner "file" {
    source = "script2.sh"
    destination = "/tmp/script2.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/script.sh",
      "bash /tmp/script.sh ${var.SUB_DOMAIN} ${var.DOMAIN}",
    ]
  }

  provisioner "local-exec" {
    command = "echo ${digitalocean_droplet.proxy.ipv4_address} >> public_ips.txt"
  }
}
