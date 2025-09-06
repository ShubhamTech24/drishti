import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  event: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      try {
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            
            // Handle different message types
            if (message.event === 'incident') {
              toast({
                title: "New Incident Detected",
                description: `${message.data.event?.severity?.toUpperCase()} incident in ${message.data.event?.zoneId}`,
                variant: message.data.event?.severity === 'critical' ? 'destructive' : 'default',
              });
            } else if (message.event === 'alert_generated') {
              toast({
                title: "Alert Broadcast",
                description: `Alert sent to ${message.data.zone}`,
              });
            } else if (message.event === 'new_notification') {
              toast({
                title: "New Alert from Admin",
                description: message.data.title,
                variant: message.data.severity === 'critical' ? 'destructive' : 'default',
              });
            } else if (message.event === 'new_help_request') {
              toast({
                title: "New Help Request",
                description: `Help needed: ${message.data.requestType}`,
              });
            } else if (message.event === 'help_request_update') {
              toast({
                title: "Help Request Update",
                description: `Your request status: ${message.data.status}`,
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        socket.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            connect();
          }, 3000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [toast]);

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, data }));
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    lastMessage,
    sendMessage
  };
}
