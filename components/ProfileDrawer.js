import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    TextInput,
    Share,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import {
    fetchProfileData,
    addFamily,
    addDailyHelp,
    addVehicle,
    addPet,
    addAddress,
} from '../services/profileService';

const { width } = Dimensions.get('window');

const ProfileDrawer = ({ visible, onClose, slideAnim }) => {
    const navigation = useNavigation();
    const { user, token, logout } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({});
    const [address, setAddress] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    const firstName = user?.name?.split(' ')[0] || 'Resident';
    const lastName = user?.name?.split(' ')[1] || '';
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    const flatNo = user?.apartmentName || 'Apartment';

    useEffect(() => {
        if (visible) fetchProfile();
    }, [visible]);

    const fetchProfile = async () => {
        try {
            const data = await fetchProfileData(token);
            setProfileData(data);
            setAddress(data.address || '');
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleChange = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (modalType === 'Family') await addFamily(formData, token);
            else if (modalType === 'Daily Help') await addDailyHelp(formData, token);
            else if (modalType === 'Vehicles') await addVehicle(formData, token);
            else if (modalType === 'Pets') await addPet(formData, token);
            else if (modalType === 'Address') {
                await addAddress(formData, token);
                setAddress(formData.address);
            }
            setModalVisible(false);
            setFormData({});
            await fetchProfile();
        } catch (err) {
            console.error('Submit error:', err);
            alert('Error saving data');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({ message: 'Check out this awesome apartment app!' });
        } catch (err) {
            alert('Error sharing: ' + err.message);
        }
    };

    return visible ? (
        <View style={styles.drawerOverlay}>
            <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                <TouchableOpacity onPress={onClose} style={styles.closeDrawer}>
                    <MaterialIcons name="close" size={28} color="#333" />
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.profileRow}>
                            <View>
                                <Text style={styles.nameText}>{firstName} {lastName}</Text>
                                <Text style={styles.flatText}>{flatNo}</Text>
                            </View>
                            <View style={styles.avatarCircle}><Text style={styles.avatarText}>{initials}</Text></View>
                        </View>
                    </View>

                    {/* Household Grid */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Household</Text>
                        <View style={styles.grid}>
                            {[
                                { label: 'Family', icon: 'people-outline', count: profileData?.family?.length || 0 },
                                { label: 'Daily Help', icon: 'bicycle-outline', count: profileData?.dailyHelp?.length || 0 },
                                { label: 'Vehicles', icon: 'car-outline', count: profileData?.vehicles?.length || 0 },
                                { label: 'Pets', icon: 'paw-outline', count: profileData?.pets?.length || 0 },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={styles.gridItem}
                                    onPress={() => navigation.navigate('Household', { type: item.label })}
                                >
                                    <Ionicons name={item.icon} size={24} color="#444" />
                                    <Text style={styles.gridLabel}>{item.label}</Text>

                                    {/* Show count badge */}
                                    {item.count > 0 && (
                                        <View style={styles.countBadge}>
                                            <Text style={styles.countText}>{item.count}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}

                        </View>
                    </View>

                    {/* Address */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Address</Text>
                            <TouchableOpacity onPress={handleShare}><Feather name="share-2" size={18} color="#444" /></TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 8 }}>
                            {address ? <Text style={styles.addressText}>{address}</Text> : <Text style={styles.notAddedText}>Not yet added</Text>}
                        </View>
                        <TouchableOpacity style={styles.addAddressButton} onPress={() => { setModalType('Address'); setModalVisible(true); }}>
                            <Text style={styles.addAddressButtonText}>{address ? 'Update Address' : 'Add Address'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Settings */}
                    <View style={styles.sectionCard}>
                        {[
                            { label: 'Support & Feedback', icon: 'chatbubbles-outline', onPress: () => navigation.navigate('Support') },
                            { label: 'Tell a Friend About the App', icon: 'share-social-outline', onPress: handleShare },
                            { label: 'Terms of Service', icon: 'document-text-outline', onPress: () => navigation.navigate('Terms') },
                            { label: 'Privacy Policy', icon: 'lock-closed-outline', onPress: () => navigation.navigate('Privacy') },
                        ].map((item) => (
                            <TouchableOpacity key={item.label} style={styles.rowItem} onPress={() => { onClose(); item.onPress(); }}>
                                <Ionicons name={item.icon} size={20} color="#444" style={{ marginRight: 8 }} />
                                <Text style={styles.rowText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={[styles.rowItem, { marginTop: 12 }]} onPress={() => { onClose(); logout(); }}>
                            <Feather name="log-out" size={20} color="#d00" style={{ marginRight: 8 }} />
                            <Text style={[styles.rowText, { color: '#d00' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.footerText}>© Developed & Designed by Prizmabrixx</Text>
                </ScrollView>
            </Animated.View>
        </View>
    ) : null;
};

export default ProfileDrawer;

// Styles unchanged …


const styles = StyleSheet.create({
    drawerOverlay: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    drawer: {
        position: 'absolute',
        top: 0, bottom: 0, right: 0,
        width: width * 0.88,
        backgroundColor: '#fff',
        paddingTop: 55,
        paddingLeft: 10,
        paddingRight: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: -4, height: 0 },
        elevation: 8,
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
    },
    closeDrawer: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    profileCard: {
        backgroundColor: '#f8f8f8',
        borderRadius: 16,
        padding: 18,
        marginBottom: 18,
    },
    profileRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nameText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    flatText: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    avatarCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    completeBtn: {
        marginTop: 14,
        backgroundColor: '#6C63FF',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    completeBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    sectionCard: {
        backgroundColor: '#faf8f8ff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 18,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
    },
    manageText: {
        fontSize: 14,
        color: '#6C63FF',
        fontWeight: '500',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '47%',
        backgroundColor: '#ebe7e7ff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    gridLabel: {
        marginTop: 6,
        fontSize: 14,
        color: '#333',
    },
    addCircle: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 20,
        height: 20,
        backgroundColor: '#FFEB3B',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#fff',
        fontSize: 14,
        color: '#444',
        minHeight: 60,
    },
    addressText: {
        fontSize: 15,
        color: '#333',
        marginTop: 4,
    },

    notAddedText: {
        fontSize: 15,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 4,
    },

    addAddressButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#6C63FF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },

    addAddressButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },

    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rowText: {
        fontSize: 15,
        color: '#333',
    },
    footerText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#aaa',
        marginTop: 20,
    },
    profileButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },

    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#6C63FF',
        paddingVertical: 10,
        borderRadius: 10,
        flex: 1,
    },

    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 15,
    },

    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#6C63FF',
        paddingVertical: 10,
        borderRadius: 10,
        flex: 1,
    },

    outlineButtonText: {
        color: '#6C63FF',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 15,
    },
    profileCompletionContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },

    profileHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },

    profilePrompt: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },

    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    editBtnText: {
        color: '#6C63FF',
        fontSize: 14,
        marginLeft: 4,
    },

    progressBarBackground: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
    },

    progressBarFill: {
        height: '100%',
        backgroundColor: '#6C63FF',
        borderRadius: 5,
    },

    progressText: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },

    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#535151ff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 12,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 14,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: '#666',
    },
    submitBtn: {
        backgroundColor: '#6C63FF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    countBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#6C63FF',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },

});

