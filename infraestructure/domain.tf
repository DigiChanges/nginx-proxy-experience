
resource "digitalocean_record" "experience_subdomain" {
  domain = var.DOMAIN
  name   = var.SUB_DOMAIN
  type   = "A"
  value  = digitalocean_droplet.proxy.ipv4_address
}
