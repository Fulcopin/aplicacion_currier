import 'dart:async';
import '../models/product_model.dart';

class ProductService {
  // Datos simulados para productos
  final List<Product> _mockProducts = [
    Product(
      id: '1',
      nombre: 'Smartphone XYZ',
      descripcion: 'Último modelo con cámara de alta resolución y batería de larga duración',
      peso: 0.2,
      precio: 899.99,
      cantidad: 1,
      fechaCreacion: DateTime.now().subtract(const Duration(days: 5)),
    ),
    Product(
      id: '2',
      nombre: 'Laptop ABC',
      descripcion: 'Potente laptop para trabajo y gaming con procesador de última generación',
      peso: 2.5,
      precio: 1299.99,
      cantidad: 1,
      link: 'https://example.com/laptop',
      fechaCreacion: DateTime.now().subtract(const Duration(days: 10)),
    ),
    Product(
      id: '3',
      nombre: 'Auriculares Bluetooth',
      descripcion: 'Auriculares inalámbricos con cancelación de ruido y gran calidad de sonido',
      peso: 0.3,
      precio: 149.99,
      cantidad: 2,
      fechaCreacion: DateTime.now().subtract(const Duration(days: 3)),
    ),
  ];

  // Método para obtener todos los productos
  Future<List<Product>> getProducts() async {
    // Simular retraso de red
    await Future.delayed(const Duration(seconds: 1));
    return List.from(_mockProducts);
  }

  // Método para agregar un producto
  Future<Product> addProduct(Product product) async {
    // Simular retraso de red
    await Future.delayed(const Duration(seconds: 1));
    
    // Crear una copia del producto con un ID generado
    final newProduct = Product(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      nombre: product.nombre,
      descripcion: product.descripcion,
      peso: product.peso,
      precio: product.precio,
      cantidad: product.cantidad,
      link: product.link,
      fechaCreacion: DateTime.now(),
    );
    
    _mockProducts.add(newProduct);
    return newProduct;
  }

  // Método para eliminar un producto
  Future<void> deleteProduct(String id) async {
    // Simular retraso de red
    await Future.delayed(const Duration(seconds: 1));
    
    _mockProducts.removeWhere((product) => product.id == id);
  }
}

