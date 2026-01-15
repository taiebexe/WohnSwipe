package com.wohnswipe.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "user_profiles")
@Data
public class UserProfile {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String name;
    private Integer age;
    private String job;
    
    @Column(name = "net_income_range")
    private String netIncomeRange;
    
    @Column(name = "move_in_date")
    private LocalDate moveInDate;
    
    private String pets;
    private Boolean smoker;
    private String bio;
    
    private String districts;
    
    @Column(name = "max_rent")
    private BigDecimal maxRent;
    
    @Column(name = "preferred_rooms")
    private Double preferredRooms;
    
    private String tone; // default friendly
}
