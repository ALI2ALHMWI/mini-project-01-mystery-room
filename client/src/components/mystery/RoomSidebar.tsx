import { NavLink } from "react-router-dom";

import type { MysteryListItem } from "../../types/mystery.types";
import "./RoomSidebar.css";

interface RoomSidebarProps {
  rooms: MysteryListItem[];
  currentRoomTitle: string;
  currentRoomId: string;
  completedQuestions: number;
  totalQuestions: number;
}

function RoomSidebar({
  rooms,
  currentRoomTitle,
  currentRoomId,
  completedQuestions,
  totalQuestions,
}: RoomSidebarProps) {
  const progress =
    totalQuestions > 0
      ? Math.round((completedQuestions / totalQuestions) * 100)
      : 0;

  return (
    <aside className="room-sidebar">
      <div className="room-sidebar__heading">
        <span className="room-sidebar__eyebrow">Mystery Rooms</span>
        <h2>Explore</h2>
      </div>

      <nav className="room-sidebar__list" aria-label="Mystery rooms">
        {rooms.map((room) => {
          const isCurrent = room.id === currentRoomId;
          const isUnlocked = room.unlocked || isCurrent;

          return (
            <NavLink
              key={room.id}
              to={isUnlocked ? `/mystery/${encodeURIComponent(room.id)}` : "#"}
              className={`room-sidebar__room ${isCurrent ? "room-sidebar__room--active" : ""} ${!isUnlocked ? "room-sidebar__room--locked" : ""}`}
              onClick={(event) => {
                if (!isUnlocked) event.preventDefault();
              }}
              aria-current={isCurrent ? "page" : undefined}
              aria-disabled={!isUnlocked}
            >
              <span className="room-sidebar__icon" aria-hidden="true">
                {isUnlocked ? "◉" : "▣"}
              </span>

              <span className="room-sidebar__room-content">
                <strong>{isCurrent ? currentRoomTitle : room.title}</strong>
                <small>{room.description}</small>
              </span>

              {isCurrent && (
                <span className="room-sidebar__active-dot" aria-hidden="true" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="room-sidebar__progress">
        <div className="room-sidebar__progress-header">
          <span>Progress</span>
          <strong>
            {completedQuestions}/{totalQuestions}
          </strong>
        </div>

        <div
          className="room-sidebar__progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Mystery progress"
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        <p>Keep exploring to uncover the truth.</p>
      </div>
    </aside>
  );
}

export default RoomSidebar;
