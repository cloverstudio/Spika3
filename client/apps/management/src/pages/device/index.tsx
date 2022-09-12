import React, { useEffect } from "react";
import Layout from "../layout";
import { useHistory, useParams } from "react-router-dom";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Paper, Fab } from "@mui/material";
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
} from "@mui/icons-material/";
import { Device } from "@prisma/client";
import { useGet } from "../../lib/useApi";
import { useShowSnackBar } from "../../components/useUI";
import { ListResponseType } from "../../lib/customTypes";
import { successResponseType } from "../../../../../../server/components/response";

export default function Dashboard() {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [list, setList] = React.useState<DeviceType[]>([]);
    const [pageSize, setPageSize] = React.useState<number>(30);
    const [totalCount, setTotalCount] = React.useState<number>(0);
    const urlParams = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = React.useState("");
    const { data, isLoading } =
        urlParams.id == null
            ? useGetDevicesQuery(page)
            : useGetDevicesForUserQuery({ page: page, userId: urlParams.id });
    const dispatch = useDispatch();
    const isRightDrawerOpen = useSelector(selectRightSidebarOpen);
    const [showEditDrawer, setShowEditDrawer] = React.useState<boolean>(false);
    const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(0);
    const showSnackBar = useShowSnackBar();
    const showBasicDialog = useShowBasicDialog();
    const [deleteDevice, deleteDeviceMutation] = useDeleteDeviceMutation();
    const { data: deviceSearchData, isLoading: deviceSearchIsLoading } =
        useGetDevicesBySearchTermQuery(searchTerm);

    const hideDrawer = () => {
        setShowEditDrawer(false);
        dispatch(hideCreateUser());
    };

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
        (async () => {
            const delayDebounceFn = setTimeout(() => {
                if (!deviceSearchIsLoading) {
                    if (searchTerm.length > 0) {
                        setList(deviceSearchData.list);
                        setPageSize(deviceSearchData.limit);
                        setTotalCount(deviceSearchData.count);
                    } else {
                        setList(data.list);
                        setPageSize(data.limit);
                        setTotalCount(data.count);
                    }
                }
            }, 2000);
        })();
    }, [deviceSearchData]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

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
                    onClick={(e) => {
                        setSelectedDeviceId(params.id);
                        setShowEditDrawer(true);
                        dispatch(openCreateUser());
                    }}
                    showInMenu
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={(e) => {
                        showBasicDialog({ text: "Please confirm delete." }, async () => {
                            try {
                                await deleteDevice(params.id);
                            } catch (e) {
                                console.error(e);
                                showSnackBar({
                                    severity: "error",
                                    text: "Server error, please check browser console.",
                                });
                            }
                        });
                    }}
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
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                        mb: "1em",
                    }}
                >
                    <TextField
                        label="Search Device"
                        id="outlined-size-small"
                        size="small"
                        sx={{ minWidth: 400 }}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <Button
                        type="submit"
                        color="spikaButton"
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => dispatch(openCreateUser())}
                    >
                        ADD DEVICE
                    </Button>
                </Stack>
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
                <Drawer
                    PaperProps={{
                        sx: {
                            backgroundColor: theme.palette.spikaMainBackgroundColor.main,
                        },
                    }}
                    anchor="right"
                    sx={{ zIndex: 1300 }}
                    open={isRightDrawerOpen}
                    onClose={hideDrawer}
                >
                    <Box width={400}>
                        {showEditDrawer ? (
                            <DeviceEdit deviceId={String(selectedDeviceId)} />
                        ) : (
                            <DeviceAdd />
                        )}
                    </Box>
                </Drawer>
            </Paper>
        </Layout>
    );
}
