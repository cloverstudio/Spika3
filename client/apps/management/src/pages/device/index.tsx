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

import { Device } from "@prisma/client";

import { wait } from "../../../../../lib/utils";
import { useGet } from "../../lib/useApi";
import { useShowSnackBar } from "../../components/useUI";
import { ListResponseType } from "../../lib/customTypes"
import { Box } from '@mui/system';


export default function Dashboard() {

  const [loading, setLoading] = React.useState<boolean>(false);
  const [list, setList] = React.useState<Array<Device>>([]);
  const [pageSize, setPageSize] = React.useState<number>(30);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  const showSnackBar = useShowSnackBar();
  const history = useHistory();
  const get = useGet();

  useEffect(() => {

    (async () => {
      await fetchData(0);
    })();

  }, []);

  const fetchData = async (page: number) => {

    setLoading(true);

    try {

      const response: ListResponseType<Device> = await get(`/api/management/device?page=${page}`);
      setList(response.list);
      setPageSize(response.limit);
      setTotalCount(response.count);
    } catch (e) {
      console.error(e);
      showSnackBar({ severity: "error", text: "Server error, please check browser console." })
    }

    setLoading(false);

  }


  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.2, sortable: false, filterable: false },
    { field: 'userId', headerName: 'User Id', flex: 1, minWidth: 300, sortable: false, filterable: false },
    { field: 'deviceId', headerName: 'Device Id', flex: 0.5, sortable: false, filterable: false },
    { field: 'type', headerName: 'Type', flex: 0.5, sortable: false, filterable: false },
    { field: 'osName', headerName: 'OS Name', flex: 0.5, sortable: false, filterable: false },
    { field: 'appVersion', headerName: 'App Version', flex: 0.3, sortable: false, filterable: false },
    { field: 'token', headerName: 'Token', flex: 0.5, sortable: false, filterable: false },
    { field: 'pushToken', headerName: 'Push Token', flex: 0.5, sortable: false, filterable: false },
    { field: 'tokenExpired', headerName: 'Token Expired', type: 'dateTime', flex: 0.5, sortable: false, filterable: false },
    { field: 'createdAt', headerName: 'Created', type: 'dateTime', flex: 0.5, sortable: false, filterable: false },
    { field: 'modifiedAt', headerName: 'Modified', type: 'dateTime', flex: 0.5, sortable: false, filterable: false },
    {
      field: 'actions',
      type: 'actions',
      width: 80,
      getActions: (params: Device) => [
        <GridActionsCellItem
          icon={<DescriptionIcon />}
          label="Detail"
          onClick={() => history.push(`/device/detail/${params.id}`)}
          showInMenu
        />,
        < GridActionsCellItem
          icon={< EditIcon />}
          label="Edit"
          onClick={() => history.push(`/device/edit/${params.id}`)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => history.push(`/device/delete/${params.id}`)}
          showInMenu
        />
      ]
    },
  ];

  return (
    <Layout subtitle="Devices">
      <Paper
        sx={{
          margin: '24px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', width: '100%', flexGrow: 1 }}>
          <DataGrid
            autoHeight
            rows={list}
            columns={columns}
            pageSize={pageSize}
            rowCount={totalCount}
            pagination
            paginationMode="server"
            onPageChange={(newPage) => fetchData(newPage)}
            loading={loading} />
        </div>
      </Paper >

      <Fab color="primary" aria-label="add" className="fab-main" onClick={e => {
        history.push("/device/add");
      }}>
        <AddIcon />
      </Fab>
    </Layout >
  );
}