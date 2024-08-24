/* eslint-disable no-useless-catch */
var is_initialized = false;
var ipware_defs = null;
var ipware_precedence_list = [];
var ipware_proxy_precedence_list = [];
var ipware_proxy_list = [];
var ipware_prefix_list = [];

let conf = `
{
    "IPWARE_HTTP_HEADER_PRECEDENCE_ORDER": [
      "HTTP_X_FORWARDED_FOR",
      "HTTP_CLIENT_IP",
      "HTTP_X_REAL_IP",
      "HTTP_X_FORWARDED",
      "HTTP_X_CLUSTER_CLIENT_IP",
      "HTTP_FORWARDED_FOR",
      "HTTP_FORWARDED",
      "HTTP_VIA",
      "X_FORWARDED_FOR",
      "REMOTE_ADDR"
    ],
  
    "IPWARE_HTTP_HEADER_PROXY_PRECEDENCE_ORDER": [
      "HTTP_X_FORWARDED_FOR",
      "X_FORWARDED_FOR"
    ],
  
    "IPWARE_TRUSTED_PROXY_LIST": [
    ],
  
    "IPV4_EXTERNALLY_NON_ROUTABLE_IP_PREFIX": [
      "0."
    ],
  
    "IPV4_CLASS_A_PRIVATE_BLOCK_IP_PREFIX": [
      "10."
    ],
  
    "IPV4_CARRIER_GRADE_NAT_IP_PREFIX": [
      "100.64.",
      "100.65.",
      "100.66.",
      "100.67.",
      "100.68.",
      "100.69.",
      "100.70.",
      "100.71.",
      "100.72.",
      "100.73.",
      "100.74.",
      "100.75.",
      "100.76.",
      "100.77.",
      "100.78.",
      "100.79.",
      "100.80.",
      "100.81.",
      "100.82.",
      "100.83.",
      "100.84.",
      "100.85.",
      "100.86.",
      "100.87.",
      "100.88.",
      "100.89.",
      "100.90.",
      "100.91.",
      "100.92.",
      "100.93.",
      "100.94.",
      "100.95.",
      "100.96.",
      "100.97.",
      "100.98.",
      "100.99.",
      "100.100.",
      "100.101.",
      "100.102.",
      "100.103.",
      "100.104.",
      "100.105.",
      "100.106.",
      "100.107.",
      "100.108.",
      "100.109.",
      "100.110.",
      "100.111.",
      "100.112.",
      "100.113.",
      "100.114.",
      "100.115.",
      "100.116.",
      "100.117.",
      "100.118.",
      "100.119.",
      "100.120.",
      "100.121.",
      "100.122.",
      "100.123.",
      "100.124.",
      "100.125.",
      "100.126.",
      "100.127."
    ],
  
    "IPV4_LOCAL_LINK_BLOCK_IP_PREFIX": [
      "169.254."
    ],
  
    "IPV4_CLASS_B_PRIVATE_BLOCK_IP_PREFIX": [
      "172.16.",
      "172.17.",
      "172.18.",
      "172.19.",
      "172.20.",
      "172.21.",
      "172.22.",
      "172.23.",
      "172.24.",
      "172.25.",
      "172.26.",
      "172.27.",
      "172.28.",
      "172.29.",
      "172.30.",
      "172.31."
    ],
  
    "IPV4_INAA_SPECIAL_ADDRESS_REGISTRY_IP_PREFIX": [
      "192.0.0."
    ],
  
    "IPV4_DOCUMENTATION_AND_EXAMPLE_CODE_192_IP_PREFIX": [
      "192.0.2."
    ],
  
    "IPV4_CLASS_C_PRIVATE_BLOCK_IP_PREFIX": [
      "192.168."
    ],
  
    "IPV4_INNER_NETWORK_COMMUNICATION_BETWEEN_TWO_SEPARATE_SUBNETS_IP_PREFIX": [
      "198.18.",
      "198.19."
    ],
  
    "IPV4_DOCUMENTATION_AND_EXAMPLE_CODE_198_IP_PREFIX": [
      "198.51.100."
    ],
  
    "IPV4_DOCUMENTATION_AND_EXAMPLE_CODE_203_IP_PREFIX": [
      "203.0.113."
    ],
  
    "IPV4_MULTICAST_IP_PREFIX": [
      "224.",
      "225.",
      "226.",
      "227.",
      "228.",
      "229.",
      "230.",
      "231.",
      "232.",
      "233.",
      "234.",
      "235.",
      "236.",
      "237.",
      "238.",
      "239."
    ],
  
    "IPV4_RESERVED_IP_PREFIX": [
      "240.",
      "241.",
      "242.",
      "243.",
      "244.",
      "245.",
      "246.",
      "247.",
      "248.",
      "249.",
      "250.",
      "251.",
      "252.",
      "253.",
      "254."
    ],
    
    "IPV4_BRODCAST_IP_PREFIX": [
      "255."
    ],
  
    "IPV4_LOOPBACK_IP_PREFIX": [
      "127."
    ],
  
    "IPV6_EXAMPLE_CODE_DOCUMENTATION_IP_PREFIX": [
      "2001:db8:"
    ],
  
    "IPV6_PRIVATE_BLOCK_IP_PREFIX": [
      "fc00:"
    ],
  
    "IPV6_LINK_LOCAL_UNICAST_IP_PREFIX": [
      "fe80:"
    ],
  
    "IPV6_MULTICAST_IP_PREFIX": [
      "ff00:"
    ],
  
    "IPV6_LOOPBACK_IP_PREFIX": [
      "::1"
    ]
  
  }
`

export default function (config_file) {
    var _me = {};
    function get_precedence_list() {
        // eslint-disable-next-line no-useless-catch
        try {
            ipware_precedence_list = ipware_defs.IPWARE_HTTP_HEADER_PRECEDENCE_ORDER;
        } catch(e) {
            throw e; 
        }
    }

    function get_proxy_precedence_list() {
        try {
            ipware_proxy_precedence_list = ipware_defs.IPWARE_HTTP_HEADER_PROXY_PRECEDENCE_ORDER;
        } catch(e) {
            throw e;
        }
    }

    function get_proxy_list() {
        try {
            ipware_proxy_list = ipware_defs.IPWARE_TRUSTED_PROXY_LIST;
        } catch(e) {
            throw e;
        }
    }

    function get_non_routable_prefix_list() {
        for (var prefix in ipware_defs) {
            if (prefix.indexOf('IPV4') === 0 || prefix.indexOf('IPV6') === 0) {
                var private_prefix = ipware_defs[prefix];
                ipware_prefix_list = ipware_prefix_list.concat(private_prefix);
            }
        }
        if (ipware_prefix_list.length === 0) {
            throw "No private IP prefix found in " + _conf;
        }
    }

    function get_config_file() {
        try {
            ipware_defs = JSON.parse(conf);
        } catch(e) {
            throw e;
        }
    }

    function initialize() {
        if (!is_initialized) {
            get_config_file();
            get_precedence_list();
            get_proxy_precedence_list();
            get_proxy_list();
            get_non_routable_prefix_list();
            is_initialized = true;
        }
    }

    _me.cleanup_ip = function (ip) {
        var ip = ip.trim();
        if (ip.toLowerCase().startsWith('::ffff:')) {
            return ip.substring('::ffff:'.length)
        }
        return ip;
    }

    _me.is_loopback_ip = function (ip) {
        var ip = ip.toLowerCase().trim();
        return ip === '127.0.0.1' || ip === '::1';
    }

    _me.is_private_ip = function (ip) {
        var ip = ip.toLowerCase();
        for (var i = 0; i < ipware_prefix_list.length; i++) {
            var prefix = ipware_prefix_list[i];
            if (ip.indexOf(prefix.toLowerCase()) === 0) {
                return true;
            }
        }
        return false;
    }

    _me.is_valid_ipv4 = function (ip) {
        var ipv4_pattern = /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/;
        if (!ipv4_pattern.test(ip)) {
            return false;
        }
        var token = ip.split('.');
        return token[0] <= 255 && token[1] <= 255 && token[2] <= 255 && token[3] <= 255;
    }

    _me.is_valid_ipv6 = function (ip) {
        var ipv6_pattern = /^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/;
        return ipv6_pattern.test(ip)
    }

    _me.is_valid_ip = function (ip) {
        return _me.is_valid_ipv4(ip) || _me.is_valid_ipv6(ip);
    }

    _me.get_headers_attribute = function (headers, key) {
        var key_upper = key.toUpperCase();
        if (key_upper in headers) {
            return headers[key_upper];
        }

        var key_lower = key.toLowerCase();
        if (key_lower in headers) {
            return headers[key_lower];
        }

        var alt_key_lower = key_lower.replace(/_/g, '-');
        if (alt_key_lower in headers) {
            return headers[alt_key_lower];
        }

        var alt_key_upper = alt_key_lower.toUpperCase()
        if (alt_key_upper in headers) {
            return headers[alt_key_upper];
        }

        return null;
    }

    _me.get_local_ip = function (req) {
        var ip = '127.0.0.1';
        try {
            ip = req.connection.remoteAddress;
        } catch (e) {
            try {
                ip = req.socket.remoteAddress;
            } catch (e) {
                try {
                    ip = req.connection.socket.remoteAddress;
                } catch (e) {
                    ip = '127.0.0.1';
                }
            }
        }
        return ip || '127.0.0.1';
    }

    _me.get_ip = function (req, right_most_proxy) {

        initialize();
        req.clientIpRoutable = false;
        req.clientIp = null;
        var value = null;
        var right_most_proxy = right_most_proxy || false;

        for (var i = 0; i < ipware_precedence_list.length; i++) {
            value = _me.get_headers_attribute(req.headers, ipware_precedence_list[i].trim());
            if (value) {
                var ips = value.split(',');
                if (right_most_proxy) {
                    ips = ips.reverse();
                }
                for (var j = 0; j < ips.length; j++) {
                    var ip = _me.cleanup_ip(ips[j]);
                    if (ip && _me.is_valid_ip(ip)) {
                        if (_me.is_private_ip(ip)) {
                            if (!req.clientIp || (!_me.is_loopback_ip(ip) &&
                                _me.is_loopback_ip(req.clientIp))) {
                                req.clientIp = ip;
                            }
                        } else {
                            req.clientIp = ip;
                            req.clientIpRoutable = true;
                            return {clientIp: req.clientIp, clientIpRoutable: req.clientIpRoutable}
                        }
                    }
                }
            }
        }
        if (!req.clientIp) {
            req.clientIp = _me.get_local_ip(req);
            req.clientIpRoutable = !_me.is_private_ip(req.clientIp);
        }

        return {clientIp: req.clientIp, clientIpRoutable: req.clientIpRoutable}
    };

    _me.get_trusted_ip = function (req, trusted_proxies, right_most_proxy) {
        initialize();
        var trusted_proxies = trusted_proxies || ipware_proxy_list;
        var right_most_proxy = right_most_proxy || false;
        req.clientIpRoutable = false;
        req.clientIp = null;
        var value = null;

        if (trusted_proxies.length >= 1) {
            for (var i = 0; i < ipware_proxy_precedence_list.length; i++) {
                value = _me.get_headers_attribute(req.headers, ipware_proxy_precedence_list[i].trim());
                if (value) {
                    var ips = value.split(',');
                    if (ips.length > 1 && right_most_proxy) {
                        ips = ips.reverse();
                    }
                    if (ips.length > 1) {
                        for (var j = 0; j < trusted_proxies.length; j++) {
                            if (trusted_proxies[j] === ips[ips.length-1].trim()) {
                                var ip = _me.cleanup_ip(ips[0]);
                                if (ip && _me.is_valid_ip(ip)) {
                                    req.clientIp = ip;
                                    req.clientIpRoutable = !_me.is_private_ip(ip);
                                    return {clientIp: req.clientIp, clientIpRoutable: req.clientIpRoutable}
                                }
                            }
                        }
                    }
                }
            }
        }

        if (!req.clientIp) {
            req.clientIp = _me.get_local_ip(req);
            req.clientIpRoutable = !_me.is_private_ip(req.clientIp);
        }

        return {clientIp: req.clientIp, clientIpRoutable: req.clientIpRoutable}
    };

    return _me;
};