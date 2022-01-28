import React from "react";

export default ({ title, children, onClose, onOK }: { title: string, children: React.ReactElement<any, any>, onClose: Function, onOK: Function }) => {
    return <div className="modal" >
        <div className="setting-window">
            <i className="fas fa-times" onClick={e => onClose()}></i>
            <span>{title}</span>
            {children}
            <button onClick={e => onOK()}>
                OK
            </button>
        </div>
    </div>;
};
