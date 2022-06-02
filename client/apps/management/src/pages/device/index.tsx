import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Paper, Fab } from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
} from "@mui/icons-material/";
import { Device } from "@prisma/client";
import { useGetDevicesQuery, useGetDevicesForUserQuery } from "../../api/device";
import DeviceType from "../../types/Device";

export default function Dashboard() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [list, setList] = React.useState<DeviceType[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const urlParams = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const { data, isLoading } =
        urlParams.id == null
            ? useGetDevicesQuery(page)
            : useGetDevicesForUserQuery({ page: page, userId: urlParams.id });

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                setList(data.list);
                setPageSize(data.limit);
                setTotalCount(data.count);
            }
        })();
    }, [data]);

    const columns = [
        { field: "id", headerName: "ID", flex: 0.2, sortable: false, filterable: false },
        {
            field: "userId",
            headerName: "User Id",
            flex: 1,
            minWidth: 300,
            sortable: false,
            filterable: false,
        },
        {
            field: "deviceId",
            headerName: "Device Id",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        { field: "type", headerName: "Type", flex: 0.5, sortable: false, filterable: false },
        { field: "osName", headerName: "OS Name", flex: 0.5, sortable: false, filterable: false },
        {
            field: "appVersion",
            headerName: "App Version",
            flex: 0.3,
            sortable: false,
            filterable: false,
        },
        { field: "token", headerName: "Token", flex: 0.5, sortable: false, filterable: false },
        {
            field: "pushToken",
            headerName: "Push Token",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "tokenExpired",
            headerName: "Token Expired",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "createdAt",
            headerName: "Created",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "modifiedAt",
            headerName: "Modified",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "actions",
            type: "actions",
            width: 80,
            getActions: (params: Device) => [
                <GridActionsCellItem
                    icon={<DescriptionIcon />}
                    label="Detail"
                    onClick={() => navigate(`/device/detail/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => navigate(`/device/edit/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => navigate(`/device/delete/${params.id}`)}
                    showInMenu
                />,
            ],
        },
    ];

    return (
        <Layout subtitle="Devices">
            <Paper
                sx={{
                    margin: "24px",
                    padding: "24px",
                }}
            >
                <div style={{ display: "flex", width: "100%", flexGrow: 1 }}>
                    <DataGrid
                        autoHeight
                        rows={list}
                        columns={columns}
                        pageSize={pageSize}
                        rowCount={totalCount}
                        pagination
                        paginationMode="server"
                        onPageChange={(newPage) => setPage(newPage)}
                        loading={loading}
                    />
                </div>
            </Paper>

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: "absolute", right: 64, bottom: 128, zIndex: 100 }}
                onClick={(e) => {
                    navigate("/device/add");
                }}
            >
                <AddIcon />
            </Fab>
        </Layout>
    );
}
