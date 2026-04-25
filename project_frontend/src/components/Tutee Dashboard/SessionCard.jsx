export default function SessionCard({ subject, tutor, date, time, link }) {
    return (
      <div className="bg-white rounded-2xl shadow p-4 border-l-4 border-[#efc940]">
        <h3 className="text-lg font-semibold">{subject}</h3>
        <p className="text-sm text-gray-600">Tutor: {tutor}</p>
        <p className="text-sm">{date} • {time}</p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#3b2762] font-medium hover:underline mt-2 inline-block"
        >
          Join Google Meet →
        </a>
      </div>
    );
  }
  