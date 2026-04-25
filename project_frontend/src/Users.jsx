import { useEffect, useState } from 'react';

function Users() {
  const [users, setUsers] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${backendUrl}/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">All Users</h2>
      <ul className="list-disc pl-6">
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.role} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
