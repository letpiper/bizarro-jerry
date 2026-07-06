import { useEffect, useRef, useCallback } from 'react';
import { useWorldState } from './useWorldState';
import type { Trace, Mutation, SlackMessage, CalendarEvent, GmailMessage } from '../../types';

export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const {
    addTrace,
    addMutation,
    addSlackMessage,
    addCalendarEvent,
    addGmailMessage,
  } = useWorldState();

  const connect = useCallback(() => {
    try {
      const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//localhost:3002`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'trace') {
            addTrace(data.payload as Trace);
          } else if (data.type === 'mutation') {
            addMutation(data.payload as Mutation);
          } else if (data.type === 'slack_message') {
            addSlackMessage(data.payload as SlackMessage);
          } else if (data.type === 'calendar_event') {
            addCalendarEvent(data.payload as CalendarEvent);
          } else if (data.type === 'gmail_message') {
            addGmailMessage(data.payload as GmailMessage);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [addTrace, addMutation, addSlackMessage, addCalendarEvent, addGmailMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    ws: wsRef.current,
    send: (data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    },
  };
};
