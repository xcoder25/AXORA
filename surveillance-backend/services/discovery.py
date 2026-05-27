import socket
import select
import uuid
import re
from typing import List, Dict, Any

class WSDiscovery:
    """
    WS-Discovery protocol implementation.
    Scans the local network for ONVIF-compliant devices using UDP multicast.
    """
    
    MULTICAST_ADDRESS = "239.255.255.250"
    MULTICAST_PORT = 3702
    
    SOAP_PROBE = """<?xml version="1.0" encoding="utf-8"?>
    <Envelope xmlns:tds="http://www.onvif.org/ver10/device/wsdl" xmlns:dn="http://www.onvif.org/ver10/network/wsdl" xmlns="http://www.w3.org/2003/05/soap-envelope">
      <Header>
        <MessageID xmlns="http://schemas.xmlsoap.org/ws/2004/08/addressing">uuid:{uuid}</MessageID>
        <To xmlns="http://schemas.xmlsoap.org/ws/2004/08/addressing">urn:schemas-xmlsoap-org:rpc:multicast:tx</To>
        <Action xmlns="http://schemas.xmlsoap.org/ws/2004/08/addressing">http://schemas.xmlsoap.org/ws/2004/08/dnd/Probe</Action>
      </Header>
      <Body>
        <Probe xmlns="http://schemas.xmlsoap.org/ws/2004/08/dnd">
          <Types>tds:Device dn:NetworkVideoTransmitter</Types>
        </Probe>
      </Body>
    </Envelope>
    """

    @classmethod
    def scan(cls, timeout: float = 2.0, include_mocks: bool = True) -> List[Dict[str, Any]]:
        """
        Sends WS-Discovery multicast probe and listens for replies.
        """
        devices = []
        
        # Send Multicast SOAP Probe
        msg_id = str(uuid.uuid4())
        probe_xml = cls.SOAP_PROBE.format(uuid=msg_id)
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
        sock.setblocking(False)
        sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)
        
        try:
            # Send probe to standard ONVIF multicast endpoint
            sock.sendto(probe_xml.encode('utf-8'), (cls.MULTICAST_ADDRESS, cls.MULTICAST_PORT))
            
            # Wait for responses
            ready = select.select([sock], [], [], timeout)
            while ready[0]:
                data, addr = sock.recvfrom(65535)
                decoded_data = data.decode('utf-8', errors='ignore')
                
                # Parse ONVIF response IP and XAddrs (endpoints)
                xaddrs = re.findall(r'<[^:]*:XAddrs>([^<]+)</[^:]*:XAddrs>', decoded_data)
                types = re.findall(r'<[^:]*:Types>([^<]+)</[^:]*:Types>', decoded_data)
                
                if xaddrs:
                    endpoint = xaddrs[0].strip()
                    ip_match = re.search(r'https?://([^:/]+)', endpoint)
                    device_ip = ip_match.group(1) if ip_match else addr[0]
                    
                    devices.append({
                        "ip": device_ip,
                        "xaddr": endpoint,
                        "types": types[0].strip() if types else "Unknown",
                        "source": "WS-Discovery"
                    })
                
                # Check if there are more packets immediately available
                ready = select.select([sock], [], [], 0.1)
                
        except Exception as e:
            print(f"[WSDiscovery] Scan exception: {e}")
        finally:
            sock.close()
            
        # De-duplicate devices by IP
        unique_devices = {}
        for d in devices:
            unique_devices[d["ip"]] = d
            
        results = list(unique_devices.values())
        
        # Include simulated cameras if dev-mode testing is requested or no physical camera is found
        if include_mocks and not results:
            results.extend([
                {
                    "ip": "192.168.1.50",
                    "xaddr": "http://192.168.1.50:80/onvif/device_service",
                    "types": "dn:NetworkVideoTransmitter tds:Device",
                    "source": "Simulation (Axis Cam)"
                },
                {
                    "ip": "192.168.1.60",
                    "xaddr": "http://192.168.1.60:80/onvif/device_service",
                    "types": "dn:NetworkVideoTransmitter tds:Device",
                    "source": "Simulation (Hikvision Cam)"
                }
            ])
            
        return results
