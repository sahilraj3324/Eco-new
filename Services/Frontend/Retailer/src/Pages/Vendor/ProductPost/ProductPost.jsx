import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const ProductPost = () => {

    const [sellerid, setSellerid] = useState("");
    const [information, setInformation] = useState({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        sellerId: "",  // Include sellerId in initial state
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Load sellerId from localStorage on component mount
    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setSellerid(storedUserId);
            setInformation(prev => ({ ...prev, sellerId: storedUserId })); // Update sellerId in information state
        }
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        setInformation(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post("/api/Product/add", 
                JSON.stringify(information),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setMessage("User registered successfully!");
            setInformation({
                name: "",
                description: "",
                price: 0,
                stock: 0,
                sellerId: sellerid, // Ensure sellerId is not lost after reset
            });
        } catch (error) {
            setMessage("Failed to register user. Please try again.");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", textAlign: "center" }}>
            <h2>Product Post</h2>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
                <input type="text" name="name" placeholder="Name" value={information.name} onChange={handleChange} required />
                <input type="text" name="description" placeholder="description" value={information.description} onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" value={information.price} onChange={handleChange} required />
                <input type="number" name="stock" placeholder="Stock" value={information.stock} onChange={handleChange} required />
                {/* <input type="text" name="" placeholder="Address" value={information.sellerId} onChange={handleChange} required /> */}
    
                <button type="submit" disabled={loading} style={{ padding: "10px", background: "blue", color: "white" }}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </form>

            {message && <p style={{ marginTop: "10px", color: message.includes("Failed") ? "red" : "green" }}>{message}</p>}


            
        </div>
    )
}

export default ProductPost
