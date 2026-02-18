import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export default function RatingModal({ partnerId, onClose }) {
  function rate(rating) {
    socket.emit("rateUser", {
      targetUserId: partnerId,
      rating
    });
    onClose();
  }

  return (
    <div>
      <h3>Avalie seu parceiro</h3>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => rate(n)}>
          ⭐ {n}
        </button>
      ))}
    </div>
  );
}
