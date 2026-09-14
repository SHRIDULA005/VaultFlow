// // package com.example.demo.config;

// // import org.springframework.beans.factory.annotation.Autowired;
// // import org.springframework.context.annotation.Bean;
// // import org.springframework.context.annotation.Configuration;

// // import org.springframework.security.authentication.AuthenticationManager;
// // import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// // import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// // import java.util.List;

// // import org.springframework.web.cors.CorsConfiguration;
// // import org.springframework.web.cors.CorsConfigurationSource;
// // import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
// // import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

// // import org.springframework.security.config.annotation.web.builders.HttpSecurity;

// // import org.springframework.security.config.http.SessionCreationPolicy;

// // import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// // import org.springframework.security.crypto.password.PasswordEncoder;

// // import org.springframework.security.web.SecurityFilterChain;
// // import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// // import com.example.demo.security.JwtRequestFilter;
// // import com.example.demo.service.CustomUserDetailsService;

// // @Configuration
// // @EnableMethodSecurity
// // public class SecurityConfig {

// //     @Autowired
// //     private CustomUserDetailsService customUserDetailsService;

// //     @Autowired
// //     private JwtRequestFilter jwtFilter;

// //     @Bean
// //     public PasswordEncoder passwordEncoder() {
// //         return new BCryptPasswordEncoder();
// //     }

// //     @Bean
// //     public DaoAuthenticationProvider authenticationProvider() {
// //         DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
// //         provider.setUserDetailsService(customUserDetailsService);
// //         provider.setPasswordEncoder(passwordEncoder());
// //         return provider;
// //     }

// //     @Bean
// //     public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)throws Exception {
// //         return configuration.getAuthenticationManager();
// //     }

// //     @Bean
// //     public CorsConfigurationSource corsConfigurationSource() {

// //         CorsConfiguration configuration = new CorsConfiguration();

// //         configuration.setAllowedOrigins(List.of("*"));
// //         configuration.setAllowedMethods(
// //                 List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
// //         configuration.setAllowedHeaders(List.of("*"));

// //         UrlBasedCorsConfigurationSource source =
// //             new UrlBasedCorsConfigurationSource();

// //         source.registerCorsConfiguration("/**", configuration);

// //         return source;
// //     }

// //     @Bean
// //     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
// //         http
// //             .cors(cors -> {})
// //             .csrf(csrf -> csrf.disable())
// //             .sessionManagement(session ->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
// //             .authorizeHttpRequests(auth -> auth
// //                     .requestMatchers(
// //             "/users/register",
// //                          "/auth/login",
// //                         "/swagger-ui/**",
// //                         "/swagger-ui.html",
// //                         "/v3/api-docs/**").permitAll()
// //                     .requestMatchers("/delete/**").hasRole("ADMIN")
// //                     .anyRequest().authenticated())
// //             .authenticationProvider(authenticationProvider())
// //             .addFilterBefore(jwtFilter,UsernamePasswordAuthenticationFilter.class);
// //         return http.build();
// //     }
// // }
// package com.example.demo.config;

// import java.util.List;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// import org.springframework.http.HttpMethod;

// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;

// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;

// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.CorsConfigurationSource;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// import com.example.demo.security.JwtRequestFilter;
// import com.example.demo.service.CustomUserDetailsService;


// @Configuration
// @EnableMethodSecurity
// public class SecurityConfig {


//     @Autowired
//     private CustomUserDetailsService customUserDetailsService;


//     @Autowired
//     private JwtRequestFilter jwtFilter;


//     // =========================================================
//     // PASSWORD ENCODER
//     // =========================================================

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }


//     // =========================================================
//     // AUTHENTICATION PROVIDER
//     // =========================================================

//     @Bean
//     public DaoAuthenticationProvider authenticationProvider() {

//         DaoAuthenticationProvider provider =
//                 new DaoAuthenticationProvider();

//         provider.setUserDetailsService(
//                 customUserDetailsService
//         );

//         provider.setPasswordEncoder(
//                 passwordEncoder()
//         );

//         return provider;
//     }


//     // =========================================================
//     // AUTHENTICATION MANAGER
//     // =========================================================

//     @Bean
//     public AuthenticationManager authenticationManager(
//             AuthenticationConfiguration configuration)
//             throws Exception {

//         return configuration.getAuthenticationManager();
//     }


//     // =========================================================
//     // CORS
//     // =========================================================

//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {

//         CorsConfiguration configuration =
//                 new CorsConfiguration();

//         configuration.setAllowedOrigins(
//                 List.of(
//                         "http://localhost:3000",
//                         "http://127.0.0.1:3000"
//                 )
//         );

//         configuration.setAllowedMethods(
//                 List.of(
//                         "GET",
//                         "POST",
//                         "PUT",
//                         "DELETE",
//                         "OPTIONS"
//                 )
//         );

//         configuration.setAllowedHeaders(
//                 List.of("*")
//         );

//         configuration.setAllowCredentials(true);


//         UrlBasedCorsConfigurationSource source =
//                 new UrlBasedCorsConfigurationSource();

//         source.registerCorsConfiguration(
//                 "/**",
//                 configuration
//         );

//         return source;
//     }


//     // =========================================================
//     // SECURITY FILTER CHAIN
//     // =========================================================

//     @Bean
//     public SecurityFilterChain securityFilterChain(
//             HttpSecurity http)
//             throws Exception {


//         http

//             // -------------------------------------------------
//             // CORS
//             // -------------------------------------------------

//             .cors(cors -> {})


//             // -------------------------------------------------
//             // CSRF
//             // -------------------------------------------------

//             .csrf(csrf -> csrf.disable())


//             // -------------------------------------------------
//             // STATELESS JWT SESSION
//             // -------------------------------------------------

//             .sessionManagement(session ->
//                     session.sessionCreationPolicy(
//                             SessionCreationPolicy.STATELESS
//                     )
//             )


//             // -------------------------------------------------
//             // AUTHORIZATION
//             // -------------------------------------------------

//             .authorizeHttpRequests(auth -> auth


//                     // =========================================
//                     // PUBLIC AUTHENTICATION ENDPOINTS
//                     // =========================================

//                     .requestMatchers(
//                             "/auth/login",
//                             "/auth/register",
//                             "/auth/logout",

//                             "/api/auth/login",
//                             "/api/auth/register",
//                             "/api/auth/logout",

//                             "/users/register",

//                             "/swagger-ui/**",
//                             "/swagger-ui.html",
//                             "/v3/api-docs/**"
//                     )
//                     .permitAll()


//                     // =========================================
//                     // TRANSACTION READ ACCESS
//                     // =========================================
//                     //
//                     // Any logged-in user can VIEW transactions.
//                     //
//                     // Treasurer can additionally CREATE and EDIT
//                     // through the @PreAuthorize annotations in
//                     // TransactionController / Service.
//                     // =========================================

//                     .requestMatchers(
//                             HttpMethod.GET,
//                             "/api/transactions",
//                             "/api/transactions/**"
//                     )
//                     .authenticated()


//                     // =========================================
//                     // TRANSACTION CREATE
//                     // =========================================
//                     //
//                     // Actual role restriction is handled by:
//                     //
//                     // @PreAuthorize(
//                     //     "hasAnyRole('TREASURER','ADMIN')"
//                     // )
//                     //
//                     // =========================================

//                     .requestMatchers(
//                             HttpMethod.POST,
//                             "/api/transactions"
//                     )
//                     .authenticated()


//                     // =========================================
//                     // TRANSACTION UPDATE
//                     // =========================================

//                     .requestMatchers(
//                             HttpMethod.PUT,
//                             "/api/transactions/**"
//                     )
//                     .authenticated()


//                     // =========================================
//                     // TRANSACTION DELETE
//                     // =========================================

//                     .requestMatchers(
//                             HttpMethod.DELETE,
//                             "/api/transactions/**"
//                     )
//                     .authenticated()


//                     // =========================================
//                     // ADMIN DELETE
//                     // =========================================

//                     .requestMatchers(
//                             "/delete/**"
//                     )
//                     .hasRole("ADMIN")


//                     // =========================================
//                     // EVERYTHING ELSE
//                     // =========================================

//                     .anyRequest()
//                     .authenticated()
//             )


//             // -------------------------------------------------
//             // AUTHENTICATION PROVIDER
//             // -------------------------------------------------

//             .authenticationProvider(
//                     authenticationProvider()
//             )


//             // -------------------------------------------------
//             // JWT FILTER
//             // -------------------------------------------------

//             .addFilterBefore(
//                     jwtFilter,
//                     UsernamePasswordAuthenticationFilter.class
//             );


//         return http.build();
//     }
// }
package com.example.demo.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.demo.security.JwtRequestFilter;
import com.example.demo.service.CustomUserDetailsService;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {


    @Autowired
    private CustomUserDetailsService customUserDetailsService;


    @Autowired
    private JwtRequestFilter jwtFilter;


    /*
     * =========================================================
     * PASSWORD ENCODER
     * =========================================================
     */

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    /*
     * =========================================================
     * AUTHENTICATION PROVIDER
     * =========================================================
     */

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(
                customUserDetailsService
        );

        provider.setPasswordEncoder(
                passwordEncoder()
        );

        return provider;
    }


    /*
     * =========================================================
     * AUTHENTICATION MANAGER
     * =========================================================
     */

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }


    /*
     * =========================================================
     * CORS
     * =========================================================
     */

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000",
                        "http://127.0.0.1:3000"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }


    /*
     * =========================================================
     * SECURITY FILTER CHAIN
     * =========================================================
     */

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {


        http

            /*
             * -------------------------------------------------
             * CORS
             * -------------------------------------------------
             */

            .cors(cors -> {})


            /*
             * -------------------------------------------------
             * CSRF
             * -------------------------------------------------
             */

            .csrf(csrf -> csrf.disable())


            /*
             * -------------------------------------------------
             * STATELESS JWT SESSION
             * -------------------------------------------------
             */

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )


            /*
             * -------------------------------------------------
             * AUTHORIZATION
             * -------------------------------------------------
             */

            .authorizeHttpRequests(auth -> auth


                    /*
                     * =========================================
                     * PUBLIC AUTHENTICATION ENDPOINTS
                     * =========================================
                     *
                     * These do NOT require JWT.
                     */

                    .requestMatchers(
                            "/auth/login",
                            "/auth/register",
                            "/auth/logout",

                            "/swagger-ui/**",
                            "/swagger-ui.html",
                            "/v3/api-docs/**"
                    )
                    .permitAll()


                    /*
                     * =========================================
                     * TRANSACTION READ
                     * =========================================
                     */

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/transactions",
                            "/api/transactions/**"
                    )
                    .authenticated()


                    /*
                     * =========================================
                     * TRANSACTION CREATE
                     * =========================================
                     */

                    .requestMatchers(
                            HttpMethod.POST,
                            "/api/transactions"
                    )
                    .authenticated()


                    /*
                     * =========================================
                     * TRANSACTION UPDATE
                     * =========================================
                     */

                    .requestMatchers(
                            HttpMethod.PUT,
                            "/api/transactions/**"
                    )
                    .authenticated()


                    /*
                     * =========================================
                     * TRANSACTION DELETE
                     * =========================================
                     */

                    .requestMatchers(
                            HttpMethod.DELETE,
                            "/api/transactions/**"
                    )
                    .authenticated()


                    /*
                     * =========================================
                     * ADMIN DELETE
                     * =========================================
                     */

                    .requestMatchers(
                            "/delete/**"
                    )
                    .hasRole("ADMIN")


                    /*
                     * =========================================
                     * EVERYTHING ELSE
                     * =========================================
                     */

                    .anyRequest()
                    .authenticated()
            )


            /*
             * -------------------------------------------------
             * AUTHENTICATION PROVIDER
             * -------------------------------------------------
             */

            .authenticationProvider(
                    authenticationProvider()
            )


            /*
             * -------------------------------------------------
             * JWT FILTER
             * -------------------------------------------------
             */

            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            );


        return http.build();
    }
}