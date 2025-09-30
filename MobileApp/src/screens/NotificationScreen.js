import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NotificationService from '../services/NotificationService';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  /**
   * 加载通知列表
   */
  const loadNotifications = async (offset = 0, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (offset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const newNotifications = await NotificationService.getNotificationList(offset, 20);
      
      if (offset === 0) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      setHasMore(newNotifications.length === 20);
    } catch (error) {
      console.error('Load notifications error:', error);
      Alert.alert('错误', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  /**
   * 下拉刷新
   */
  const handleRefresh = useCallback(() => {
    loadNotifications(0, true);
  }, []);

  /**
   * 加载更多
   */
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(notifications.length);
    }
  };

  /**
   * 切换编辑模式
   */
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedItems(new Set());
  };

  /**
   * 选择/取消选择通知
   */
  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    if (selectedItems.size === notifications.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(notifications.map(item => item.id)));
    }
  };

  /**
   * 标记为已读
   */
  const markAsRead = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('提示', '请选择要标记的通知');
      return;
    }

    try {
      await NotificationService.markNotificationsAsRead(Array.from(selectedItems));
      
      // 更新本地状态
      setNotifications(prev => 
        prev.map(item => 
          selectedItems.has(item.id) ? { ...item, read: true } : item
        )
      );
      
      setSelectedItems(new Set());
      setEditMode(false);
      Alert.alert('成功', '已标记为已读');
    } catch (error) {
      Alert.alert('错误', error.message);
    }
  };

  /**
   * 删除通知
   */
  const deleteNotifications = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('提示', '请选择要删除的通知');
      return;
    }

    Alert.alert(
      '确认删除',
      `确定要删除选中的 ${selectedItems.size} 条通知吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.deleteNotifications(Array.from(selectedItems));
              
              // 更新本地状态
              setNotifications(prev => 
                prev.filter(item => !selectedItems.has(item.id))
              );
              
              setSelectedItems(new Set());
              setEditMode(false);
              Alert.alert('成功', '通知已删除');
            } catch (error) {
              Alert.alert('错误', error.message);
            }
          }
        }
      ]
    );
  };

  /**
   * 点击通知项
   */
  const handleNotificationPress = (item) => {
    if (editMode) {
      toggleSelectItem(item.id);
    } else {
      // 标记为已读
      if (!item.read) {
        NotificationService.markNotificationsAsRead([item.id]);
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === item.id 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
      
      // 处理通知点击逻辑
      // 可以根据通知类型进行不同的处理
    }
  };

  /**
   * 渲染通知项
   */
  const renderNotificationItem = ({ item }) => {
    const isSelected = selectedItems.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadItem,
          isSelected && styles.selectedItem
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => {
          if (!editMode) {
            setEditMode(true);
            toggleSelectItem(item.id);
          }
        }}
      >
        {editMode && (
          <View style={styles.checkbox}>
            <Icon
              name={isSelected ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color={isSelected ? '#007AFF' : '#ccc'}
            />
          </View>
        )}
        
        <View style={styles.avatarContainer}>
          {item.senderImage ? (
            <Image source={{ uri: item.senderImage }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Icon name="notifications" size={20} color="#fff" />
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.senderName} numberOfLines={1}>
              {item.senderName || '系统通知'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          {item.body && (
            <Text style={styles.body} numberOfLines={3}>
              {item.body}
            </Text>
          )}
        </View>
        
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  /**
   * 格式化时间戳
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  /**
   * 渲染头部
   */
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>通知</Text>
      <TouchableOpacity onPress={toggleEditMode}>
        <Text style={styles.editButton}>
          {editMode ? '取消' : '编辑'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * 渲染编辑工具栏
   */
  const renderEditToolbar = () => {
    if (!editMode) return null;
    
    return (
      <View style={styles.editToolbar}>
        <TouchableOpacity onPress={toggleSelectAll} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>
            {selectedItems.size === notifications.length ? '取消全选' : '全选'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={markAsRead} style={styles.toolbarButton}>
          <Text style={styles.toolbarButtonText}>标记已读</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={deleteNotifications} style={styles.toolbarButton}>
          <Text style={[styles.toolbarButtonText, styles.deleteButtonText]}>删除</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * 渲染空状态
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="notifications-none" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>暂无通知</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderEditToolbar()}
      
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  editToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toolbarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toolbarButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadItem: {
    backgroundColor: '#f0f8ff',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default NotificationScreen;
