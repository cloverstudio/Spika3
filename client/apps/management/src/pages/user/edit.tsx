import React, { useState, useEffect } from 'react';
import Layout from '../layout'
import { useHistory, useParams } from "react-router-dom";
import faker from "faker";
import { useGet, usePut } from "../../lib/useApi";

import {
  TextField,
  Paper,
  Grid,
  Button
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { User } from "@prisma/client";
import { formItem, formItems } from "./types"

export default function Page() {
  const urlParams: { id: string } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const showSnackBar = useShowSnackBar();
  const [detail, setDetail] = React.useState<User>();
  const [forms, setForms] = React.useState<formItems>({
    displayName: {
      value: "",
      isError: false,
      helperText: ""
    }
  });

  const get = useGet();
  const put = usePut();

  useEffect(() => {

    (async () => {

      try {
        const response: User = await get(`/api/management/user/${urlParams.id}`);
        setDetail(response);
        setForms({
          displayName: {
            value: response.displayName,
            isError: false,
            helperText: ""
          }
        })
      } catch (e) {
        console.error(e);
        showSnackBar({ severity: "error", text: "Server error, please check browser console." })
      }

    })();

  }, []);

  const validateAndUpdate = async () => {
    let hasError = false;

    const newItems: formItems = { ...forms };
    newItems.displayName.isError = false;
    newItems.displayName.helperText = "";

    if (forms.displayName.value.length == 0) {
      forms.displayName.isError = true;
      forms.displayName.helperText = "Please input display name";
      hasError = true;
    }

    if (!hasError) {

      try {
        const result = await put(`/api/management/user/${urlParams.id}`, {
          displayName: forms.displayName.value,
          emailAddress: faker.internet.email(),
          telephoneNumber: faker.phone.phoneNumber(),
          avatarUrl: ""
        });

        showSnackBar({ severity: "success", text: "User updated" });
        history.push("/user");
        newItems.displayName.value = "";

      } catch (e) {
        console.error(e);
        showSnackBar({ severity: "error", text: "Failed to update user, please check console." })
      }

    }

    setForms(newItems);
  }

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
            <TextField
              required
              fullWidth
              error={forms.displayName.isError}
              label="Display Name"
              value={forms.displayName.value}
              onChange={e => {
                forms.displayName.value = e.target.value;
                setForms({ ...forms });
              }}
              helperText={forms.displayName.helperText}
            />
          </Grid>
          <Grid item xs={12} md={8} textAlign="right">
            <Button variant="contained" onClick={e => {
              validateAndUpdate();
            }}>Update user</Button>
          </Grid>
        </Grid>
      </Paper>

    </Layout >
  );
}