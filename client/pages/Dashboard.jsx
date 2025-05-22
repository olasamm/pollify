import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';
import DashboardCards from '../component/DashboardCards';
import PollTable from '../component/PollTable';

const Dashboard = () => {
  const [name, setName] = useState('User'); 
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150'); 

  useEffect(() => {

    const storedName = localStorage.getItem('name');
    if (storedName) {
      setName(storedName);
    }


    const storedAvatar = localStorage.getItem('avatar'); 
    if (storedAvatar) {
      setAvatar(storedAvatar);
    }
  }, []);

  return (
    <>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-4">
          <div className="d-flex justify-content-end align-items-center me-5 my-2">

            <p className="mb-0 me-3">Hello, {name}!</p>
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                overflow: 'hidden',
              }}
            >
              <img
                src={avatar}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          <DashboardCards />
          <PollTable />
        </div>
      </div>
    </>
  );
};

export default Dashboard;