import express, { Router } from "express";
import amqp from 'amqplib';

export type SendSMSPayload = {
    telephoneNumber: string;
    content: string
}
