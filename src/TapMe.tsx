import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './TapMe.css';
import coinImage from './assets/coin.png'; 
import { useQuery, useMutation, gql } from '@apollo/client';
import { LiaCoinsSolid } from "react-icons/lia";
import coinSound from "./assets/coinsound.mp3";
import { MdFlashOn } from "react-icons/md";

// GraphQL queries and mutations
const GET_USER = gql`
  query GetUser($username: String!) {
    getUser(username: $username) {
      id
      username
      coins
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($username: String!) {
    createUser(username: $username) {
      id
      username
      coins
    }
  }
`;

const UPDATE_COINS = gql`
  mutation UpdateCoins($id: ID!, $coins: Int!) {
    updateCoins(id: $id, coins: $coins) {
      id
      coins
    }
  }
`;

const TapMe: React.FC = () => {
  const username = "@co3labUjjwal_bot"

  const [coins, setCoins] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Load sound effect
  const soundEffect = new Audio(coinSound);
  
  // Fetch user data from GraphQL, or create a new user if not found
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { username },
    onCompleted: (data) => {
      if (data?.getUser) {
        setCoins(data.getUser.coins);
        setUserId(data.getUser.id);
      } else {
        handleCreateUser();
      }
    },
  });

  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      if (data.createUser) {
        setCoins(data.createUser.coins);
        setUserId(data.createUser.id);
      }
    },
  });

  const [updateCoins] = useMutation(UPDATE_COINS);

  // Create a new user if not found
  const handleCreateUser = () => {
    if (username) {
      createUser({ variables: { username } }).catch((err) => {
        console.error('Error creating user:', err);
      });
    } else {
      console.error('Username not found from Telegram Web App.');
    }
  };

  // Handle tap event: play sound, increase coins, and update progress
  const handleTap = (e: React.MouseEvent) => {
    soundEffect.play();
    const newCoins = coins + 1;
    setCoins(newCoins);
    setProgress((prev) => (prev + 10 > 100 ? 0 : prev + 10));

    // Calculate tap position for bubble animation
    const rect = e.currentTarget.getBoundingClientRect();
    const newBubble = { id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Update level if progress reaches 100
    if (progress + 1 >= 100) setLevel((prev) => prev + 1);
    
    setBubbles((prev) => [...prev, newBubble]);

    // Remove bubble animation after 1 second
    setTimeout(() => {
      setBubbles((prev) => prev.filter((bubble) => bubble.id !== newBubble.id));
    }, 1000);
  
    // Update the user's coin balance in the database
    if (userId) {
      updateCoins({ variables: { id: userId, coins: newCoins } })
        .then(() => console.log('Coins updated successfully'))
        .catch((err) => console.error('Error updating coins:', err));
    } else {
      console.error('User ID not found. Ensure the user creation was successful.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading user data: {error.message}</p>;

  return (
    <div className="container">
      <div className="coin-display">
        <span className="coin-count">
          <LiaCoinsSolid className="coin-icon" /> {coins}
        </span>
        <div className="user-level">Level {level}</div>
      </div>
      <motion.button
        className="tap-button"
        onClick={handleTap}
        whileTap={{ scale: 0.9 }}
        style={{ backgroundImage: `url(${coinImage})` }}
      >
        {bubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="bubble"
            style={{ left: bubble.x, top: bubble.y }}
          >
            +1
          </span>
        ))}
      </motion.button>
      <div className="progress-info">
        <MdFlashOn className="lightning-icon" />
        <span className="progress-text">{progress}/100</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default TapMe;
