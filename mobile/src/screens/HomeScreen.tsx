import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { api, Route } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface HomeScreenProps {
  onLogout: () => void;
}

const { width, height } = Dimensions.get('window');

const initialRegion = {
  latitude: 41.0082,
  longitude: 28.9784,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [pastRoutes, setPastRoutes] = useState<Route[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);

  const [currentRegion, setCurrentRegion] = useState(initialRegion);

  const { theme, toggleTheme, themeColors } = useTheme();

  const mapRef = useRef<MapView>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleZoomIn = () => {
    if (mapRef.current && currentRegion) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta / 2,
        longitudeDelta: currentRegion.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setCurrentRegion(newRegion);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && currentRegion) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 2,
        longitudeDelta: currentRegion.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setCurrentRegion(newRegion);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const routes = await api.getRoutes();
      setPastRoutes(routes);
    } catch (e) {
      console.log('Geçmiş yüklenemedi', e);
    }
  };

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLat(latitude);
    setSelectedLon(longitude);
  };

  const handleGenerate = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setRoute(null);

    try {
      const result = await api.generateRoute({
        query,
        lat: selectedLat || undefined,
        lon: selectedLon || undefined,
      });
      setRoute(result);
      setPastRoutes([result, ...pastRoutes]);
      setQuery('');
      setSelectedLat(null);
      setSelectedLon(null);
      
      // Zoom map to new route
      if (result.places.length > 0 && mapRef.current) {
        const coords = result.places.map(rp => ({
          latitude: rp.place.latitude,
          longitude: rp.place.longitude
        }));
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (err: any) {
      Alert.alert('Rota Oluşturulamadı', err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  };

  const loadPastRoute = (r: Route) => {
    setRoute(r);
    setShowHistory(false);
    setSelectedLat(null);
    setSelectedLon(null);
    if (r.places.length > 0 && mapRef.current) {
      const coords = r.places.map(rp => ({
        latitude: rp.place.latitude,
        longitude: rp.place.longitude
      }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
      <View style={[styles.navbar, { backgroundColor: themeColors.bgSecondary, borderBottomColor: themeColors.borderColor }]}>
        <View style={styles.navTitleContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.navLogo} resizeMode="contain" />
          <Text style={[styles.navTitle, { color: themeColors.textPrimary }]}>TrackMate AI</Text>
        </View>
        <View style={styles.navActions}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.historyBtn, { backgroundColor: themeColors.bgTertiary }]}>
            <Text style={{ fontSize: 16 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={[styles.historyBtn, { backgroundColor: themeColors.bgTertiary }]}>
            <Text style={[styles.historyText, { color: themeColors.textSecondary }]}>Geçmiş</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLogout} style={[styles.logoutBtn, { backgroundColor: themeColors.dangerBg }]}>
            <Text style={[styles.logoutText, { color: themeColors.dangerColor }]}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          onRegionChangeComplete={(region) => setCurrentRegion(region)}
          onPress={handleMapPress}
        >
          {selectedLat && selectedLon && (
            <Marker coordinate={{ latitude: selectedLat, longitude: selectedLon }} pinColor="red" title="Seçilen Konum" />
          )}

          {route?.places.map((rp, index) => (
            <Marker
              key={rp.id}
              coordinate={{ latitude: rp.place.latitude, longitude: rp.place.longitude }}
              pinColor="indigo"
              title={`${index + 1}. ${rp.place.name}`}
            />
          ))}

          {route && route.places.length > 1 && (
            <Polyline
              coordinates={route.places.map(rp => ({ latitude: rp.place.latitude, longitude: rp.place.longitude }))}
              strokeColor="#4f46e5"
              strokeWidth={4}
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>
        
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>
        </View>

        {!route && (
          <View style={styles.mapOverlayHint}>
            <Text style={styles.mapOverlayHintText}>
              {selectedLat ? "Konum seçildi. İsteğini yazabilirsin." : "Arama yapılacak bölgeyi seçmek için haritaya dokun (İsteğe bağlı)"}
            </Text>
          </View>
        )}
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={[styles.chatContainer, { backgroundColor: themeColors.bgPrimary }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          {!route && !loading && (
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeText, { color: themeColors.textSecondary }]}>
                Nereye gitmek istersin? İsteğini yaz, gerisini bana bırak!
              </Text>
            </View>
          )}

          {route && route.user_prompt && (
            <View style={styles.userBubble}>
              <Text style={styles.userBubbleText}>{route.user_prompt}</Text>
            </View>
          )}

          {route && route.ai_response && (
            <View style={[styles.aiBubble, { backgroundColor: themeColors.bgTertiary }]}>
              <Text style={[styles.aiBubbleText, { color: themeColors.textPrimary }]}>{route.ai_response}</Text>
              
              <View style={[styles.routeDetailsCard, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.borderColor }]}>
                <Text style={[styles.routeDetailsTitle, { color: themeColors.textSecondary }]}>Rota Planın</Text>
                {route.places.map((rp, index) => (
                  <View key={rp.id} style={[styles.routeStep, { backgroundColor: themeColors.bgPrimary }]}>
                    <View style={[styles.stepNumberBadge, { backgroundColor: themeColors.accentColor }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepName, { color: themeColors.textPrimary }]}>{rp.place.name}</Text>
                      <Text style={[styles.stepTime, { color: themeColors.textSecondary }]}>{rp.arrival_time?.slice(0,5)} - {rp.departure_time?.slice(0,5)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {loading && (
            <View style={[styles.aiBubble, { backgroundColor: themeColors.bgTertiary }]}>
              <ActivityIndicator color={themeColors.accentColor} />
              <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Rota oluşturuluyor...</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: themeColors.bgSecondary, borderTopColor: themeColors.borderColor }]}>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.bgPrimary, borderColor: themeColors.borderColor, color: themeColors.textPrimary }]}
            placeholder="Örn: 2 saatlik kahve molası"
            placeholderTextColor={themeColors.textSecondary}
            value={query}
            onChangeText={setQuery}
            editable={!loading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: themeColors.accentColor }, (!query.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleGenerate}
            disabled={!query.trim() || loading}
          >
            <Text style={styles.sendButtonText}>Gönder</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: themeColors.bgSecondary }]}>
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>Geçmiş Rotalar</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={[styles.modalClose, { color: themeColors.accentColor }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            {pastRoutes.length === 0 ? (
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Henüz bir rotanız yok.</Text>
            ) : (
              pastRoutes.map(pr => (
                <TouchableOpacity key={pr.id} style={[styles.historyItem, { backgroundColor: themeColors.bgTertiary, borderColor: themeColors.borderColor }]} onPress={() => loadPastRoute(pr)}>
                  <Text style={[styles.historyItemTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>{pr.user_prompt || pr.name || 'İsimsiz Rota'}</Text>
                  <Text style={[styles.historyItemSub, { color: themeColors.textSecondary }]}>{pr.places.length} Durak • {pr.total_duration_mins} dk</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    zIndex: 10,
  },
  navTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogo: {
    width: 24,
    height: 24,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navActions: {
    flexDirection: 'row',
    gap: 12,
  },
  historyBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  historyText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  logoutText: {
    color: '#f43f5e',
    fontWeight: '600',
    fontSize: 13,
  },
  mapContainer: {
    height: height * 0.35,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  zoomButtonText: {
    fontSize: 26,
    fontWeight: '400',
    color: '#333',
  },
  mapOverlayHint: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapOverlayHintText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  welcomeText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 20,
    borderTopRightRadius: 4,
    maxWidth: '85%',
  },
  userBubbleText: {
    color: '#ffffff',
    fontSize: 15,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    maxWidth: '90%',
    gap: 12,
  },
  aiBubbleText: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 22,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 8,
  },
  routeDetailsCard: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
    gap: 8,
  },
  routeDetailsTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#020617',
    padding: 8,
    borderRadius: 8,
  },
  stepNumberBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  stepTime: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalClose: {
    color: '#818cf8',
    fontWeight: '600',
  },
  modalScroll: {
    padding: 16,
    gap: 12,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
  },
  historyItem: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyItemTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  historyItemSub: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
