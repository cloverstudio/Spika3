import React, { useState, useEffect } from 'react';
import Layout from '../layout'
import { useHistory, useParams } from "react-router-dom";
import faker from "faker";
import { useGet, usePost } from "../../lib/useApi";

import {
  Typography,
  Paper,
  Grid,
  Button
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { User } from "@prisma/client";

export default function Page() {
  const urlParams: { id: string } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const showSnackBar = useShowSnackBar();
  const [detail, setDetail] = React.useState<User>();

  const get = useGet();

  useEffect(() => {

    (async () => {

      try {
        const response: User = await get(`/api/management/user/${urlParams.id}`);
        setDetail(response);
      } catch (e) {
        console.error(e);
        showSnackBar({ severity: "error", text: "Server error, please check browser console." })
      }

    })();

  }, []);



  return (
    <Layout subtitle={`User detail ( ${urlParams.id} )`} showBack={true} >
      <Paper
        sx={{
          margin: '24px',
          padding: '24px',
          minHeight: 'calc(100vh-64px)',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>

            {detail ?
              <Grid
                container
                component='dl' // mount a Definition List
                spacing={2}>
                <Grid item>
                  <Typography component='dt' variant='h6'>
                    ID:
                  </Typography>
                  <Typography component='dd' className="margin-bottom">
                    {detail.id}
                  </Typography>
                  <Typography component='dt' variant='h6'>
                    Display Name
                  </Typography>
                  <Typography component='dd'>
                    {detail.displayName}
                  </Typography>
                  <Typography component='dt' variant='h6'>
                    Country Code
                  </Typography>
                  <Typography component='dd'>
                    {detail.countryCode}
                  </Typography>
                  <Typography component='dt' variant='h6'>
                    Phone Number
                  </Typography>
                  <Typography component='dd'>
                    {detail.telephoneNumber}
                  </Typography>
                  <Typography component='dt' variant='h6'>
                    E-mail
                  </Typography>
                  <Typography component='dd'>
                    {detail.emailAddress}
                  </Typography>
                  <Typography component='dt' variant='h6'>
                    Avatar Url
                  </Typography>
                  <Typography component='dd'>
                    {detail.avatarUrl}
                  </Typography>
                </Grid>
              </Grid> : null}

          </Grid>
          <Grid item xs={12} md={8} textAlign="right">
            <Button className="margin-right" variant="contained" onClick={e => {
              history.push(`/user/edit/${urlParams.id}`)
            }}>Edit</Button>
            <Button color="error" variant="contained" onClick={e => {
              history.push(`/user/delete/${urlParams.id}`)
            }}>Delete</Button>
          </Grid>

        </Grid>
      </Paper>

    </Layout >
  );
}