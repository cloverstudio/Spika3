import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { Paper, Fab, Avatar } from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    CancelOutlined,
    CheckCircleOutlineOutlined,
} from "@mui/icons-material/";
import { Room } from "@prisma/client";
import { useGet } from "../../lib/useApi";
import { useShowSnackBar } from "../../components/useUI";
import { ListResponseType } from "../../lib/customTypes";
import { successResponseType } from "../../../../../../server/components/response";

export default function Room() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [list, setList] = React.useState<Array<Room>>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const urlParams: { userId: string } = useParams();

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
            const url: string =
                urlParams.userId == null
                    ? `/api/management/room?page=${page}`
                    : `/api/management/room?page=${page}&userId=${urlParams.userId}`;
            const response: successResponseType = await get(url);
            const data: ListResponseType<Room> = response.data;
            setList(data.list);
            setPageSize(data.limit);
            setTotalCount(data.count);
        } catch (e) {
            console.error(e);
            showSnackBar({
                severity: "error",
                text: "Server error, please check browser console.",
            });
        }

        setLoading(false);
    };

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
            field: "name",
            headerName: "Name",
            flex: 1,
            minWidth: 300,
            sortable: false,
            filterable: false,
        },
        {
            field: "type",
            headerName: "Type",
            flex: 0.5,
            sortable: false,
            filterable: false,
        },
        {
            field: "deleted",
            headerName: "Deleted",
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
            getActions: (params: Room) => [
                <GridActionsCellItem
                    icon={<DescriptionIcon />}
                    label="Detail"
                    onClick={() => history.push(`/room/detail/${params.id}`)}
                    showInMenu
                />,
                // <GridActionsCellItem
                //     icon={<DevicesOther />}
                //     label="Devices"
                //     onClick={() => history.push(`/room/${params.id}/devices`)}
                //     showInMenu
                // />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => history.push(`/room/edit/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => history.push(`/room/delete/${params.id}`)}
                    showInMenu
                />,
            ],
        },
    ];

    return (
        <Layout subtitle="Rooms">
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
                        onPageChange={(newPage) => fetchData(newPage)}
                        loading={loading}
                    />
                </div>
            </Paper>

            <Fab
                color="primary"
                aria-label="add"
                className="fab-main"
                onClick={(e) => {
                    history.push("/room/add");
                }}
            >
                <AddIcon />
            </Fab>
        </Layout>
    );
}
