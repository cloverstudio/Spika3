import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { Paper, Fab, Avatar } from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    CancelOutlined,
    CheckCircleOutlineOutlined,
    DevicesOther,
    MeetingRoom as RoomIcon,
} from "@mui/icons-material/";
import { User } from "@prisma/client";
import { useShowSnackBar } from "../../components/useUI";
import { useGetUsersQuery } from "../../api/user";
import UserType from "../../types/User";

export default function Dashboard() {
    const [list, setList] = React.useState<UserType[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [page, setPage] = useState(0);
    const { data, isLoading } = useGetUsersQuery(page);

    const showSnackBar = useShowSnackBar();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                setList(data.list);
                setPageSize(data.limit);
                setTotalCount(data.count);
            }
        })();
    }, [data]);

    function getFullNumber(params: { getValue: (arg0: any, arg1: string) => any; id: any }) {
        return "+" + `${params.getValue(params.id, "telephoneNumber") || ""}`;
    }

    const columns = [
        { field: "id", headerName: "ID", flex: 0.2, sortable: false, filterable: false },
        {
            field: "avatarUrl",
            headerName: "Avatar",
            flex: 0.3,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<string>) => (
                <strong>
                    <Avatar alt="Remy Sharp" src={params.value} />
                </strong>
            ),
        },
        {
            field: "displayName",
            headerName: "Display Name",
            flex: 1,
            minWidth: 300,
            sortable: false,
            filterable: false,
        },
        {
            field: "customField",
            headerName: "Phone Number",
            flex: 0.5,
            sortable: false,
            filterable: false,
            valueGetter: getFullNumber,
            sortComparator: (v1: any, v2: any) => v1!.toString().localeCompare(v2!.toString()),
        },
        {
            field: "emailAddress",
            headerName: "E-mail",
            type: "dateTime",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "verified",
            headerName: "Verified",
            type: "boolean",
            flex: 0.5,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams<boolean>) => (
                <strong>
                    {params.value ? (
                        <CheckCircleOutlineOutlined style={{ fill: "green" }} />
                    ) : (
                        <CancelOutlined style={{ fill: "red" }} />
                    )}
                </strong>
            ),
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
            getActions: (params: User) => [
                <GridActionsCellItem
                    icon={<DescriptionIcon />}
                    label="Detail"
                    onClick={() => navigate(`/user/detail/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DevicesOther />}
                    label="Devices"
                    onClick={() => navigate(`/user/${params.id}/devices`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<RoomIcon />}
                    label="Rooms"
                    onClick={() => navigate(`/user/${params.id}/room`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => navigate(`/user/edit/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => navigate(`/user/delete/${params.id}`)}
                    showInMenu
                />,
            ],
        },
    ];

    return (
        <Layout subtitle="Users">
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
                        loading={isLoading}
                    />
                </div>
            </Paper>

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: "absolute", right: 64, bottom: 128, zIndex: 100 }}
                onClick={(e) => {
                    navigate("/user/add");
                }}
            >
                <AddIcon />
            </Fab>
        </Layout>
    );
}
