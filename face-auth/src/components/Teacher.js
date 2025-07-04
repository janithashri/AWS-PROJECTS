import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableRow } from '@mui/material';

const Teacher = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const res = await fetch('/students-today');
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendance();
  }, []);

  return (
    <Box mt={4} textAlign="center">
      <Typography variant="h5">Today's Attendance - {today}</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default Teacher;
