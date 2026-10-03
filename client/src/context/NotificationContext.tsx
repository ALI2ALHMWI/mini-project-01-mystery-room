import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import "./NotificationContext.css";

export type NotificationType = "success" | "error" | "info";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface NotificationContextValue {
  showNotification: (type: NotificationType, message: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({
      id: Date.now(),
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotification(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification,
      }}
    >
      {children}

      {notification && (
        <div
          className={`notification notification--${notification.type}`}
          role="alert"
        >
          <span className="notification__message">{notification.message}</span>

          <button
            type="button"
            className="notification__close"
            onClick={hideNotification}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}
