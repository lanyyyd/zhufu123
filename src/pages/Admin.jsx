import { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Select, Button, message, List, Tabs, Modal, Popconfirm } from 'antd';
import { PlusOutlined, FormOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Content } = Layout;

// 预设的模板数据
const defaultTemplates = [
  {
    id: 1,
    name: '生日快乐',
    content: '亲爱的{name}：\n\n生日快乐！愿你的生日充满欢乐和温馨，愿你的每一天都洋溢着幸福的笑容。祝你心想事成，梦想成真！',
    mediaUrl: '',
    mediaType: ''
  },
  {
    id: 2,
    name: '想对你说的话',
    content: '亲爱的{name}：\n\n有些话一直想对你说，今天终于有机会了。感谢你一直以来的陪伴和支持，你的存在让我的生活变得更加美好。',
    mediaUrl: '',
    mediaType: ''
  },
  {
    id: 3,
    name: '节日祝福',
    content: '亲爱的{name}：\n\n在这个特别的日子里，祝愿你幸福安康，万事如意。愿你的生活充满阳光，前程似锦！',
    mediaUrl: '',
    mediaType: ''
  }
];

const Admin = () => {
  const [templates, setTemplates] = useState([]);
  const [blessings, setBlessings] = useState([]);
  const [form] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    // 从本地存储加载数据，如果没有则使用默认模板
    const storedTemplates = localStorage.getItem('templates');
    const storedBlessings = localStorage.getItem('blessings');
    
    setTemplates(storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates);
    setBlessings(storedBlessings ? JSON.parse(storedBlessings) : []);
  }, []);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsModalVisible(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    templateForm.setFieldsValue({
      templateName: template.name,
      templateContent: template.content,
      mediaType: template.mediaType,
      mediaUrl: template.mediaUrl
    });
    setIsModalVisible(true);
  };

  const handleDeleteTemplate = (templateId) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    localStorage.setItem('templates', JSON.stringify(newTemplates));
    message.success('模板删除成功！');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTemplate(null);
    templateForm.resetFields();
  };

  const handleTemplateSubmit = (values) => {
    const templateData = {
      name: values.templateName,
      content: values.templateContent,
      mediaUrl: values.mediaUrl || '',
      mediaType: values.mediaType || ''
    };

    let newTemplates;
    if (editingTemplate) {
      // 编辑现有模板
      newTemplates = templates.map(t => 
        t.id === editingTemplate.id ? { ...templateData, id: t.id } : t
      );
      message.success('模板更新成功！');
    } else {
      // 创建新模板
      const newTemplate = {
        ...templateData,
        id: Date.now()
      };
      newTemplates = [...templates, newTemplate];
      message.success('模板创建成功！');
    }

    setTemplates(newTemplates);
    localStorage.setItem('templates', JSON.stringify(newTemplates));
    setIsModalVisible(false);
    setEditingTemplate(null);
    templateForm.resetFields();
  };

  const handleSubmit = (values) => {
    const blessing = {
      id: Date.now(),
      ...values,
      template: templates.find(t => t.id === values.templateId),
      createdAt: new Date().toISOString()
    };

    const newBlessings = [...blessings, blessing];
    setBlessings(newBlessings);
    localStorage.setItem('blessings', JSON.stringify(newBlessings));

    const blessingUrl = `${window.location.origin}/blessing/${blessing.id}`;
    message.success('祝福页面创建成功！');
    form.resetFields();

    // 复制链接到剪贴板
    navigator.clipboard.writeText(blessingUrl)
      .then(() => message.success('链接已复制到剪贴板'))
      .catch(() => message.error('复制链接失败'));
  };

  return (
    <Layout style={{ minHeight: '100vh', padding: '20px', width: '100%' }}>
      <Content>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="创建祝福页面" key="1">
            <Card style={{ marginBottom: 20, width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label="被祝福人姓名"
                  rules={[{ required: true, message: '请输入被祝福人姓名' }]}
                >
                  <Input placeholder="请输入被祝福人姓名" />
                </Form.Item>

                <Form.Item
                  name="templateId"
                  label="选择祝福模板"
                  rules={[{ required: true, message: '请选择祝福模板' }]}
                >
                  <Select placeholder="请选择祝福模板">
                    {templates.map(template => (
                      <Select.Option key={template.id} value={template.id}>
                        {template.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    生成祝福页面
                  </Button>
                </Form.Item>
              </Form>
            </Card>

            <Card title="已生成的祝福页面" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
              <List
                dataSource={blessings}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => {
                          const url = `${window.location.origin}/blessing/${item.id}`;
                          navigator.clipboard.writeText(url)
                            .then(() => message.success('链接已复制'))
                            .catch(() => message.error('复制失败'));
                        }}
                      >
                        复制链接
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={<div style={{ fontSize: '16px', marginBottom: '8px' }}>{`${item.name} - ${item.template.name}`}</div>}
                      description={<div style={{ color: '#666' }}>{new Date(item.createdAt).toLocaleString()}</div>}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Tabs.TabPane>
          
          <Tabs.TabPane tab="模板管理" key="2">
            <Card 
              title="模板列表" 
              extra={<Button type="primary" icon={<FormOutlined />} onClick={handleAddTemplate}>新建模板</Button>}
              style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
            >
              <List
                dataSource={templates}
                renderItem={template => (
                  <List.Item>
                    <List.Item.Meta
                      title={<div style={{ fontSize: '16px', marginBottom: '8px' }}>{template.name}</div>}
                      description={<div style={{ whiteSpace: 'pre-wrap' }}>{template.content.substring(0, 50) + (template.content.length > 50 ? '...' : '')}</div>}
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <div>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditTemplate(template)}
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title="确定要删除这个模板吗？"
                        onConfirm={() => handleDeleteTemplate(template.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Tabs.TabPane>
        </Tabs>

        <Modal 
          title={editingTemplate ? '编辑模板' : '新建模板'} 
          visible={isModalVisible} 
          onCancel={handleModalCancel}
          footer={null}
          width="95%"
          style={{ maxWidth: '600px' }}
        >
          <Form
            form={templateForm}
            onFinish={handleTemplateSubmit}
            layout="vertical"
          >
            <Form.Item
              name="templateName"
              label="模板名称"
              rules={[{ required: true, message: '请输入模板名称' }]}
            >
              <Input placeholder="请输入模板名称" />
            </Form.Item>

            <Form.Item
              name="templateContent"
              label="模板内容"
              rules={[{ required: true, message: '请输入模板内容' }]}
              help="使用{name}作为被祝福人姓名的占位符"
            >
              <Input.TextArea 
                placeholder="请输入模板内容，使用{name}作为被祝福人姓名的占位符" 
                rows={6} 
              />
            </Form.Item>

            <Form.Item
              name="mediaType"
              label="媒体类型"
            >
              <Select placeholder="选择媒体类型（可选）">
                <Select.Option value="">无</Select.Option>
                <Select.Option value="image">图片</Select.Option>
                <Select.Option value="video">视频</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="mediaUrl"
              label="媒体URL"
              help="输入图片或视频的URL地址（可选）"
            >
              <Input placeholder="例如：https://example.com/image.jpg" />
            </Form.Item>

            <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit">
                保存模板
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default Admin;