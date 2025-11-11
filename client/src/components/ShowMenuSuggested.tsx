import { useAuthMiddleware } from '../middleware/useAuthMiddleware';
import { useQuery } from '@tanstack/react-query';
import {api} from '../services/api';

import React, { useState} from 'react';
import { 
  Table, 
  Card, 
  Spin, 
  Modal, 
  Descriptions, 
  Tag,
  Button,
  Typography,
  Collapse
} from 'antd';
import moment from 'moment';

// Define interfaces for the data structure
interface MenuSuggestion {
  id: number;
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  suggested_at: string;
  menu_data: MenuDataItem[];
}

interface MenuDataItem {
  date: string;
  dish_name: string;
  meal_type: string;
  // Add other properties as needed
}

const ShowMenuSuggested: React.FC = () => {
  const { data, isLoading, error } = useMenuSuggestions();
  const [selectedSuggestion, setSelectedSuggestion] = useState<MenuSuggestion | null>(null);
  const [isFullMenuModalVisible, setIsFullMenuModalVisible] = useState(false);

  // Color map for status
  const colorMap = {
    'PENDING': 'orange',
    'ACCEPTED': 'green',
    'REJECTED': 'red'
  };

  // Group menu data by date
  const groupMenuByDate = (menuData: MenuDataItem[]) => {
    return menuData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          Breakfast: [],
          Lunch: [],
          Dinner: []
        };
      }
      acc[item.date][item.meal_type].push(item.dish_name);
      return acc;
    }, {} as Record<string, Record<string, string[]>>);
  };

  // Columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string) => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof colorMap) => (
        <Tag color={colorMap[status] || 'default'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Suggested At',
      dataIndex: 'suggested_at',
      key: 'suggested_at',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: MenuSuggestion) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedSuggestion(record);
            setIsFullMenuModalVisible(true);
          }}
        >
          View Full Menu
        </Button>
      )
    }
  ];

  // Full Menu Modal
  const renderFullMenuModal = () => {
    if (!selectedSuggestion) return null;

    const groupedMenuData = groupMenuByDate(selectedSuggestion.menu_data);

    return (
      <Modal
        title={`Full Menu Details - Suggestion ID: ${selectedSuggestion.id}`}
        open={isFullMenuModalVisible}
        onCancel={() => setIsFullMenuModalVisible(false)}
        width="90%"
        footer={null}
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Start Date">
            {moment(selectedSuggestion.start_date).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {moment(selectedSuggestion.end_date).format('YYYY-MM-DD')}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={colorMap[selectedSuggestion.status]}>
              {selectedSuggestion.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Suggested At">
            {moment(selectedSuggestion.suggested_at).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Title level={4} style={{ marginTop: 20 }}>
          Detailed Menu
        </Typography.Title>

        <Collapse accordion>
          {Object.entries(groupedMenuData).map(([date, meals]) => (
            <Collapse.Panel key={date} header={`Date: ${date}`}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Breakfast">
                  {meals.Breakfast.join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="Lunch">
                  {meals.Lunch.join(', ')}
                </Descriptions.Item>
                <Descriptions.Item label="Dinner">
                  {meals.Dinner.join(', ')}
                </Descriptions.Item>
              </Descriptions>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Modal>
    );
  };

  // Main render
  return (
    <Card 
      title="Menu Suggestions" 
      extra={`Total Suggestions: ${data?.length || 0}`}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Table 
            columns={columns}
            dataSource={data || []}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
          />
          
          {renderFullMenuModal()}
        </>
      )}
    </Card>
  );
};

// Query Hook
const useMenuSuggestions = () => {
  const { user } = useAuthMiddleware();

  const { data, isLoading, error } = useQuery<MenuSuggestion[]>({
    queryKey: ['menu-suggestions', user?.id],
    queryFn: async () => {
      try {
        const response = await api.get('/menu-suggestions');
        
        // Log the full response for debugging
        console.log('Full Menu Suggestions Response:', response.data);

        // Return the response data
        return response.data;
      } catch (error) {
        console.error('Menu Suggestions Fetch Error:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 1,
  });

  return { data, isLoading, error };
};

export default ShowMenuSuggested;