import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableRow } from '@mui/material';

const Student = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = JSON.parse(sessionStorage.getItem('authInfo'))?.externalImageId;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`/attendance?studentId=${studentId}`);
        const data = await res.json();
        setAttendance(data.attendance || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  return (
    <Box mt={4} textAlign="center">
      <Typography variant="h5">My Attendance - {studentId}</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableBody>
            {attendance.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default Student;
