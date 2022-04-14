import React from "react";
import { SvgIconTypeMap } from "@mui/material";

import FolderZipIcon from "@mui/icons-material/FolderZip";
import ArticleIcon from "@mui/icons-material/Article";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BorderAllIcon from "@mui/icons-material/BorderAll";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import { OverridableComponent } from "@mui/material/OverridableComponent";

export default function getFileIcon(type: string): OverridableComponent<SvgIconTypeMap> {
    switch (type) {
        case "image/jpeg":
        case "image/avif":
        case "image/bmp":
        case "image/gif":
        case "image/svg+xml":
        case "image/tiff":
        case "image/webp":
        case "image/png": {
            return ImageIcon;
        }

        case "application/zip":
        case "application/gzip":
        case "application/x-7z-compressed": {
            return FolderZipIcon;
        }

        case "application/pdf": {
            return PictureAsPdfIcon;
        }

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/msword": {
            return ArticleIcon;
        }

        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        case "application/vnd.ms-excel":
        case "text/csv": {
            return BorderAllIcon;
        }

        case "video/mp4":
        case "video/mpeg":
        case "video/ogg":
        case "video/mp2t":
        case "video/webm": {
            return OndemandVideoIcon;
        }

        case "video/mp4":
        case "video/mpeg":
        case "video/ogg":
        case "video/mp2t":
        case "video/webm": {
            return OndemandVideoIcon;
        }

        case "audio/aac":
        case "audio/midi":
        case "audio/x-midi":
        case "audio/mpeg":
        case "audio/ogg":
        case "audio/opus":
        case "audio/wav":
        case "audio/webm": {
            return AudioFileIcon;
        }

        default:
            return InsertDriveFileIcon;
    }
}
