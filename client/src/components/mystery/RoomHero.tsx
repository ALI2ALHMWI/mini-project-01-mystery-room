import { Link } from "react-router-dom";

import libraryImage from "../../assets/generated/room-library.jpg";
import secretPassageImage from "../../assets/generated/room-secret-passage.jpg";
import hiddenChamberImage from "../../assets/generated/room-hidden-chamber.jpg";

import "./RoomHero.css";

interface RoomHeroProps {
  mysteryId: string;
  title: string;
  description: string;
  story: string;
  questionNumber: number;
  totalQuestions: number;
}

const roomImages: Record<string, string> = {
  "mystery-1": libraryImage,
  "mystery-2": secretPassageImage,
  "mystery-3": hiddenChamberImage,
};

function RoomHero({
  mysteryId,
  title,
  description,
  story,
  questionNumber,
  totalQuestions,
}: RoomHeroProps) {
  const roomImage = roomImages[mysteryId] ?? libraryImage;

  const progress =
    totalQuestions > 0
      ? Math.round(((questionNumber - 1) / totalQuestions) * 100)
      : 0;


  return (
    <section className="room-hero">
      <div className="room-hero__image-wrapper">
        <img className="room-hero__image" src={roomImage} alt={`${title} room`} />
        <div className="room-hero__image-overlay" />
        <div className="room-hero__image-label">
          <span>Current room</span>
          <strong>{title}</strong>
        </div>
      </div>

      <div className="room-hero__body">
        <div className="room-hero__intro">
          <span className="room-hero__eyebrow">Investigation in progress</span>
          <h1>{title}</h1>
          <p className="room-hero__description">{description}</p>
        </div>

        <div className="room-hero__story">
          <h2>What you discover</h2>
          <p>{story}</p>
        </div>

        <Link
          className="room-hero__explore"
          to={`/mystery/${encodeURIComponent(mysteryId)}/explore`}
        >
          Explore the Room
          <span aria-hidden="true">→</span>
        </Link>

        <div className="room-hero__progress">
          <div className="room-hero__progress-header">
            <span>Room progress</span>
            <strong>
              Question {questionNumber} / {totalQuestions}
            </strong>
          </div>

          <div className="room-hero__progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoomHero;
