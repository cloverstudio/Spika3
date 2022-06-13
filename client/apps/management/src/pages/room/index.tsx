import React, { useEffect, useState } from "react";
import Layout from "../layout";
import { useNavigate, useParams } from "react-router-dom";
import { DataGrid, GridActionsCellItem, GridRenderCellParams } from "@mui/x-data-grid";
import { Paper, Fab, Avatar, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    CheckCircleOutlineOutlined,
} from "@mui/icons-material/";
import { Room } from "@prisma/client";

import { createTheme, darken, lighten } from "@mui/material/styles";
import { makeStyles } from "@material-ui/styles";
import {
    useGetRoomsQuery,
    useGetRoomsForUserQuery,
    useGetDeletedRoomsQuery,
    useGetDeletedRoomsForUserQuery,
} from "../../api/room";
import RoomType from "../../types/Room";

const defaultTheme = createTheme();
const useStyles = makeStyles(
    (theme: {
        palette: {
            mode: string;
            info: { main: any };
            success: { main: any };
            warning: { main: any };
            error: { main: any };
        };
    }) => {
        const getBackgroundColor = (color: string) =>
            theme.palette.mode === "dark" ? darken(color, 0.6) : lighten(color, 0.6);

        const getHoverBackgroundColor = (color: string) =>
            theme.palette.mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);

        return {
            root: {
                "& .super-app-theme--true": {
                    backgroundColor: getBackgroundColor(theme.palette.info.main),
                    "&:hover": {
                        backgroundColor: getHoverBackgroundColor(theme.palette.info.main),
                    },
                },
                "& .super-app-theme--false": {
                    backgroundColor: getBackgroundColor(theme.palette.success.main),
                    "&:hover": {
                        backgroundColor: getHoverBackgroundColor(theme.palette.success.main),
                    },
                },
            },
        };
    },
    { defaultTheme }
);

export default function RoomIndex() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [list, setList] = React.useState<RoomType[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const [deleteFilter, setDeleteFilter] = React.useState<boolean>(false);
    const [page, setPage] = useState(0);
    const urlParams = useParams();

    const navigate = useNavigate();
    const classes = useStyles();

    const { data, isLoading } = !deleteFilter
        ? urlParams.id == null
            ? useGetRoomsQuery(page)
            : useGetRoomsForUserQuery({ page: page, userId: urlParams.id })
        : urlParams.id == null
        ? useGetDeletedRoomsQuery({ page: page, deleted: deleteFilter })
        : useGetDeletedRoomsForUserQuery({
              page: page,
              userId: urlParams.id,
              deleted: deleteFilter,
          });

    useEffect(() => {
        (async () => {
            if (!isLoading) {
                setList(data.list);
                setPageSize(data.limit);
                setTotalCount(data.count);
            }
        })();
    }, [data]);

    useEffect(() => {
        (async () => {})();
    }, [deleteFilter]);

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
                    {!params.value ? "" : <CheckCircleOutlineOutlined style={{ fill: "red" }} />}
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
                    onClick={() => navigate(`/room/detail/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => navigate(`/room/edit/${params.id}`)}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => navigate(`/room/delete/${params.id}`)}
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
                <FormGroup>
                    <FormControlLabel
                        label="Only Deleted"
                        control={
                            <Checkbox
                                checked={deleteFilter}
                                onChange={(e) => {
                                    setDeleteFilter(e.target.checked);
                                }}
                            />
                        }
                    />
                </FormGroup>
                <div
                    style={{ display: "flex", width: "100%", flexGrow: 1 }}
                    className={classes.root}
                >
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
                        getRowClassName={(params) =>
                            `super-app-theme--${params.getValue(params.id, "deleted")}`
                        }
                    />
                </div>
            </Paper>

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: "absolute", right: 64, bottom: 128, zIndex: 100 }}
                onClick={(e) => {
                    navigate("/room/add");
                }}
            >
                <AddIcon />
            </Fab>
        </Layout>
    );
}
