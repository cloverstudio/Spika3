import React, { useState, useEffect } from 'react';
import Layout from '../layout'
import { useHistory } from "react-router-dom";
import faker from "faker";
import { usePost } from "../../lib/useApi";

import {
  TextField,
  Paper,
  Grid,
  Button
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { useShowSnackBar } from "../../components/useUI";
import { formItem, formItems } from "./types"

export default function Dashboard() {
  const dispatch = useDispatch();
  const history = useHistory();
  const showSnackBar = useShowSnackBar();
  const [name, setName] = React.useState<string>("");
  const [forms, setForms] = React.useState<formItems>({
    displayName: {
      value: "",
      isError: false,
      helperText: ""
    }
  });

  const post = usePost();

  const validateAndAdd = async () => {
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
        const result = await post("/api/management/user", {
          displayName: forms.displayName.value,
          emailAddress: faker.internet.email(),
          telephoneNumber: faker.phone.phoneNumber(),
          avatarUrl: ""
        });

        showSnackBar({ severity: "success", text: "User added" });
        history.push("/user");
        newItems.displayName.value = "";

      } catch (e) {
        console.error(e);
        showSnackBar({ severity: "error", text: "Failed to add user, please check console." })
      }

    }

    setForms(newItems);
  }

  return (
    <Layout subtitle="Add new user" showBack={true}>
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
              validateAndAdd();
            }}>Add new user</Button>
          </Grid>
        </Grid>
      </Paper>

    </Layout >
  );
}