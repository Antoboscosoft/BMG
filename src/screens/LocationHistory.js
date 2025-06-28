import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../language/commondir';
import { getLocationHistory } from '../api/auth';

function LocationHistory({ navigation, route }) {
  const { userData } = route.params;
  const { languageTexts } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locations, setLocations] = useState([]);
  const [skip, setSkip] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [noData, setNoData] = useState(false);
  const limit = 25;
  const [hasMore, setHasMore] = useState(true);

  const fetchLocations = useCallback(async (currentSkip = 0, isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getLocationHistory(userData.id, currentSkip, limit);
      console.log("response >>> ! ", response);

      if (response.status) {
        if (isRefreshing || currentSkip === 0) {
          setLocations(response.data || []);
        } else {
          setLocations(prev => [...prev, ...(response.data || [])]);
        }
        setTotalCount(response.total_count || 0);
        setHasMore(response.data?.length === limit);
        setNoData(false);
      } else if (!response.status && response.details === "No locations found") {
        setLocations([]);
        setTotalCount(0);
        setHasMore(false);
        setNoData(true);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setNoData(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData.id]);

  useEffect(() => {
    fetchLocations(0);
  }, [fetchLocations]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const newSkip = skip + limit;
      setSkip(newSkip);
      fetchLocations(newSkip);
    }
  };

  const handleRefresh = () => {
    setSkip(0);
    setNoData(false);
    fetchLocations(0, true);
  };

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(err => console.error('Failed to open Google Maps:', err));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.locationItem}>
      <View
        style={[
          styles.locationCard,
          index === 0 && styles.currentLocationCard,
        ]}
      >
        <View style={styles.locationHeader}>
          <Icon name="location-on" size={20} color="#5e3b15" />
          <Text style={styles.dateText}>
            {new Date(item.date_time).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>
        <Text style={styles.cityText}>{item.city}</Text>
        <Text style={styles.addressText}>{item.full_address}</Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => openGoogleMaps(item.latitude, item.longitude)}
        >
          <Icon name="map" size={20} color="#FFF" />
          <Text style={styles.mapButtonText}>
            {languageTexts?.profile?.locationView?.ViewonGoogleMaps || "View on Google Map"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loading || skip === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  };

  return (
    <LinearGradient colors={['#5e3b15', '#b06a2c']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {languageTexts?.profile?.locationView?.title || 'Location History'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && skip === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : noData ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {languageTexts?.profile?.locationView?.noLocation || 'No location data available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#5e3b15']}
              tintColor="#5e3b15"
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  locationItem: {
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 16,
  },
  currentLocationCard: {
    backgroundColor: '#e6ffe6',
    borderWidth: 2,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5e3b15',
    fontWeight: 'bold',
  },
  cityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5e3b15',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  mapButtonText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default LocationHistory;