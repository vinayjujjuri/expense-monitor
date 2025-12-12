import { DebitForm } from '@/components/debit-form';
import React from 'react';

const AddDebitPage = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Add Debit Page</h1>
            <DebitForm/>
        </div>
    );
};

export default AddDebitPage;