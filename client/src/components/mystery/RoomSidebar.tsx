import { NavLink } from "react-router-dom";

import "./RoomSidebar.css";

interface RoomSidebarProps {
  currentRoomTitle: string;
  currentRoomId: string;
  completedQuestions: number;
  totalQuestions: number;
}

const rooms = [
  {
    id: "mystery-1",
    label: "Room 1",
    subtitle: "The Old Library",
  },
  {
    id: "mystery-2",
    label: "Room 2",
    subtitle: "The Secret Passage",
  },
  {
    id: "mystery-3",
    label: "Room 3",
    subtitle: "The Hidden Chamber",
  },
  {
    id: "mystery-4",
    label: "Room 4",
    subtitle: "The Final Room",
  },
];

function RoomSidebar({
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
          const isFirstRoom = room.id === "mystery-1";

          return (
            <NavLink
              key={room.id}
              to={isFirstRoom || isCurrent ? `/mystery/${room.id}` : "#"}
              className={`room-sidebar__room ${
                isCurrent ? "room-sidebar__room--active" : ""
              } ${
                !isFirstRoom && !isCurrent ? "room-sidebar__room--locked" : ""
              }`}
              onClick={(event) => {
                if (!isFirstRoom && !isCurrent) {
                  event.preventDefault();
                }
              }}
              aria-current={isCurrent ? "page" : undefined}
              aria-disabled={!isFirstRoom && !isCurrent}
            >
              <span className="room-sidebar__icon" aria-hidden="true">
                {isFirstRoom || isCurrent ? "◉" : "▣"}
              </span>

              <span className="room-sidebar__room-content">
                <strong>{isCurrent ? currentRoomTitle : room.label}</strong>
                <small>{room.subtitle}</small>
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
