import React from 'react';
import { Table, Badge } from 'react-bootstrap';

const PollTable = () => {
  return (
    <div>
      <h5 className="mb-3">Recent Polls</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Created Date</th>
            <th>Status</th>
            <th>Total Votes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sanple Title</td>
            <td>Jan. 3, 2021</td>
            <td><Badge bg="success">Open</Badge></td>
            <td>3 Opnt</td>
          </tr>
          <tr>
            <td>Sanple Title</td>
            <td>Jan. 24, 2021</td>
            <td><Badge bg="secondary">Closed</Badge></td>
            <td>5 Closed</td>
          </tr>
          <tr>
            <td>Sample Title</td>
            <td>Apr. 13, 2021</td>
            <td><Badge bg="secondary">Closed</Badge></td>
            <td>42 Total</td>
          </tr>
          <tr>
            <td>Tester Title</td>
            <td>Apr. 13, 2021</td>
            <td><Badge bg="secondary">Closed</Badge></td>
            <td>4 Closed</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default PollTable;