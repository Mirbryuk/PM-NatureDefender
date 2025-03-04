import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Image, Alert, Button, Modal } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import avatar from '../../imgs/login/avatar.png';
import wave from '../../imgs/login/wave.png';
import bg from '../../imgs/login/bg.png';
import styles from './Zayvka.module.css';

// Кастомная иконка для маркера
const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function LocationPicker({ onLocationSelect }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            const newPosition = e.latlng;
            setPosition(newPosition);
            onLocationSelect(newPosition.lat.toFixed(4), newPosition.lng.toFixed(4));
        }
    });

    return position ? <Marker position={position} icon={markerIcon} /> : null;
}


function Zayvka() {
    const [image, setImage] = useState(null);
    const [email, setEmail] = useState('');
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setLongitude(longitude.toFixed(4));
            setLatitude(latitude.toFixed(4));
        });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
    
        if (!image) {
            console.error('Файл изображения не выбран');
            setIsSubmitting(false);
            return;
        }
    
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = async () => {
            const base64Image = reader.result.split(',')[1];
    
            const applicationData = {
                photo: base64Image,
                email,
                location: {
                    type: 'Point',  // тип геометрии
                    coordinates: [parseFloat(latitude), parseFloat(longitude)]  // массив координат
                },
                description,
            };
            
    
            try {
                const response = await axios.post('http://localhost:8000/applications/', applicationData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Заявка успешно отправлена:', response.data);
                setIsSubmitting(false);
                setShowAlert(true);
                setImage(null);
                setEmail('');
                setDescription('');
            } catch (error) {
                const errorMessage = error.response ? error.response.data : error.message;
                console.error('Ошибка при отправке заявки:', errorMessage);
                setIsSubmitting(false);
            }
        };
    };
    

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setImage(file);
    };

    //  Функция для обновления координат
    const handleLocationSelect = (lat, lng) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    return (
        <div className={styles.zayvkaContainer}>
            <img src={wave} className={styles.wave} alt="wave" />
            <div className={styles.container}>
                <div className={styles.img}>
                    <img src={bg} alt="background" />
                </div>
                <div className={styles.zayvkaContent}>
                    <Alert variant="success" show={showAlert} dismissible>
                        Заявка успешно отправлена! Ваша заявка очень важна для нас, вместе мы очистим природу от мусора!
                    </Alert>

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className={styles.avatarWrapper}>
                            <img src={avatar} alt="avatar" className={styles.avatar} />
                        </div>
                        <h2 className={styles.title}>Заявка</h2>

                        <div className={styles.inputDiv}>
                            <div className={styles.icon}>
                                <i className="fas fa-camera"></i>
                            </div>
                            <div className={styles.inputWrapper}>
                                <h5>Фото</h5>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    className={styles.input}
                                    accept=".jpg, .jpeg, .png"
                                />
                            </div>
                        </div>

                        {image && (
                            <div className={styles.preview}>
                                <Image src={URL.createObjectURL(image)} fluid />
                            </div>
                        )}

                        <div className={styles.inputDiv}>
                            <div className={styles.icon}>
                                <i className="fas fa-user"></i>
                            </div>
                            <div className={styles.inputWrapper}>
                                <h5>Email</h5>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.locationWrapper}>
                            <div>
                                <h5>Геопозиция</h5>
                                <input type="text" value={`${latitude}, ${longitude}`} readOnly className={styles.input} />
                            </div>
                            <Button variant="primary" onClick={() => setShowMap(true)}>
                                Выбрать на карте
                            </Button>
                        </div>

                        <div className={styles.inputDiv}>
                            <div className={styles.icon}>
                                <i className="fas fa-pencil-alt"></i>
                            </div>
                            <div className={styles.inputWrapper}>
                                <h5>Описание</h5>
                                <textarea
                                    className={styles.input}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.buttonsWrapper}>
                            <button
                                type="submit"
                                className={`${styles.btn} ${isSubmitting ? styles.submitting : ''}`}
                                disabled={isSubmitting || !email || !latitude || !longitude || !description || !image}
                            >
                                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Модальное окно с картой */}
            <Modal show={showMap} onHide={() => setShowMap(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Выберите место</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <MapContainer center={[latitude, longitude]} zoom={13} style={{ height: "400px", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker onLocationSelect={handleLocationSelect} />
                    </MapContainer>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMap(false)}>Подтвердить</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Zayvka;
