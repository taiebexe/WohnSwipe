package com.wohnswipe.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "listings")
@Data
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String district;
    private String address;
    private BigDecimal rent;
    private Double rooms;
    
    @Column(name = "size_sqm")
    private Double sizeSqm;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "available_from")
    private LocalDate availableFrom;
    
    @Column(name = "contact_email")
    private String contactEmail;
    
    @Column(name = "landlord_name")
    private String landlordName;
    
    @Column(name = "image_url")
    private String imageUrl;
}
