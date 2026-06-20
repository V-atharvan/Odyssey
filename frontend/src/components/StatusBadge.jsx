import React from 'react';

const STATUS_STYLES = {
    PENDING: 'badge-warning',
    VERIFIED: 'badge-success',
    OPEN: 'badge-success',
    IN_PROGRESS: 'badge-primary',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
    REJECTED: 'badge-danger',
    ASSIGNED: 'badge-primary',
    SUBMITTED: 'badge-warning',
    SHORTLISTED: 'badge-primary',
    ESCROWED: 'badge-primary',
    RELEASED: 'badge-success',
};

export default function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || 'badge-gray';
    return <span className={`badge ${style}`}>{status?.replace(/_/g, ' ')}</span>;
}
