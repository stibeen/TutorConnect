// components/Receipt.jsx
import React from 'react';

const ReceiptFormat = ({ studentName, tutorName, sessionDate, amount }) => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white text-black shadow-md print:shadow-none print:p-0 print:bg-white">
      <h1 className="text-xl font-bold text-center mb-4">TutorConnect Receipt</h1>
      <p><strong>Student:</strong> {studentName}</p>
      <p><strong>Tutor:</strong> {tutorName}</p>
      <p><strong>Session Date:</strong> {sessionDate}</p>
      <p><strong>Amount:</strong> ₱{amount}.00</p>
      <p className="mt-4 text-sm text-gray-500">Thank you for using TutorConnect!</p>
    </div>
  );
};

export default ReceiptFormat;
