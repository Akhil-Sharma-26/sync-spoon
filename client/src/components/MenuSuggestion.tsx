import React, { useState } from 'react';
import { DatePicker, Form, Button, message, Card, Select } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const MenuSuggestionGenerator: React.FC = () => {
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [generatedSuggestion, setGeneratedSuggestion] = useState<any>(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleGenerateMenu = async (values: any) => {
        setIsLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:5000/generate_menu_suggestion', {
                start_date: values.start_date.format('DD/MM/YYYY'),
                end_date: values.end_date.format('DD/MM/YYYY'),
                user_id: user?.user?.id
            });

            setGeneratedSuggestion(response.data);
            message.success('Menu suggestion generated successfully!');
        } catch (error) {
            message.error('Failed to generate menu suggestion');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitSuggestion = async () => {
        if (!generatedSuggestion) return;
    
        try {
            await axios.patch('http://127.0.0.1:5000/update_menu_suggestion_status', {
                suggestion_id: generatedSuggestion.suggestion_id,
                status: form.getFieldValue('suggestion_status') || 'REVIEWED',
                user_id: user?.user?.id
            });
            
            message.success('Menu suggestion submitted for review');
            setGeneratedSuggestion(null);
            form.resetFields();
        } catch (error) {
            message.error('Failed to submit menu suggestion');
            console.error(error);
        }
    };

    return (
        <Card title="Generate Menu Suggestion">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerateMenu}
            >
                <Form.Item
                    name="start_date"
                    label="Start Date"
                    rules={[{ required: true, message: 'Please select start date' }]}
                >
                    <DatePicker 
                        style={{ width: '100%' }} 
                        disabledDate={(current) => 
                            current && current < moment().startOf('day')
                        }
                    />
                </Form.Item>

                <Form.Item
                    name="end_date"
                    label="End Date"
                    dependencies={['start_date']}
                    rules={[
                        { required: true, message: 'Please select end date' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startDate = getFieldValue('start_date');
                                if (!startDate || !value || value.isAfter(startDate)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('End date must be after start date'));
                            },
                        }),
                    ]}
                >
                    <DatePicker 
                        style={{ width: '100%' }} 
                        disabledDate={(current) => 
                            current && current < moment().startOf('day')
                        }
                    />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={isLoading}
                    >
                        Generate Menu Suggestion
                    </Button>
                </Form.Item>
            </Form>

            {generatedSuggestion && (
                <>
                    <Form.Item
                        name="suggestion_status"
                        label="Suggestion Status"
                    >
                        <Select placeholder="Select Status">
                            <Option value="REVIEWED">Reviewed</Option>
                            <Option value="PENDING">Pending</Option>
                            <Option value="APPROVED">Approved</Option>
                            <Option value="REJECTED">Rejected</Option>
                        </Select>
                    </Form.Item>
                    <Card 
                        title="Generated Menu Suggestion" 
                        extra={
                            <Button 
                                type="primary" 
                                onClick={handleSubmitSuggestion}
                            >
                                Submit Suggestion
                            </Button>
                        }
                    >
                        <div>
                            <h3>Date Range: {generatedSuggestion.start_date} - {generatedSuggestion.end_date}</h3>
                            <h4>Menu Items:</h4>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Meal Type</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Dish Name</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {generatedSuggestion.menu_items.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.date}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.meal_type}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.dish_name}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.planned_quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}
        </Card>
    );
};

export default MenuSuggestionGenerator;