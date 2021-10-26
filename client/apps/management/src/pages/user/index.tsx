import React, { useState, useEffect } from 'react';
import Layout from '../layout'
import { useHistory } from "react-router-dom";
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  IconButton,
  Paper,
  Fab
} from "@mui/material";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Description as DescriptionIcon
} from "@mui/icons-material/";

import { User } from "@prisma/client";

import { useGet } from "../../lib/useApi";
import { useShowSnackBar } from "../../components/useUI";
import { ListResponseType } from "../../lib/customTypes"
import { Box } from '@mui/system';


export default function Dashboard() {

  const [list, setList] = React.useState<Array<User>>([]);

  const showSnackBar = useShowSnackBar();
  const history = useHistory();
  const get = useGet();

  useEffect(() => {

    (async () => {

      try {
        const response: ListResponseType<User> = await get("/api/management/user");
        console.log(response.list)
        setList(response.list);
      } catch (e) {
        console.error(e);
        showSnackBar({ severity: "error", text: "Server error, please check browser console." })
      }

    })();

  }, []);


  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.2 },
    { field: 'displayName', headerName: 'Display Name', flex: 1, minWidth: 300 },
    { field: 'createdAt', headerName: 'Created', type: 'dateTime', flex: 0.5 },
    { field: 'modifiedAt', headerName: 'Modified', type: 'dateTime', flex: 0.5 },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params: User) => [
        <GridActionsCellItem
          icon={<DescriptionIcon />}
          label="Detail"
          onClick={() => history.push(`/user/detail/${params.id}`)}
          showInMenu
        />,
        < GridActionsCellItem
          icon={< EditIcon />}
          label="Edit"
          onClick={() => history.push(`/user/edit/${params.id}`)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => history.push(`/user/delete/${params.id}`)}
          showInMenu
        />
      ]
    },
  ];

  return (
    <Layout subtitle="Users">
      <Paper
        sx={{
          margin: '24px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', width: '100%', flexGrow: 1 }}>
          <DataGrid autoHeight rows={list} columns={columns} />
        </div>
      </Paper >

      <Fab color="primary" aria-label="add" className="fab-main" onClick={e => {
        history.push("/user/add");
      }}>
        <AddIcon />
      </Fab>
    </Layout >
  );
}