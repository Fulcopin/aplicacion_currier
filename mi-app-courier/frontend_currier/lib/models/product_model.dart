class Product {
  final String id;
  final String nombre;
  final String descripcion;
  final double peso;
  final double precio;
  final int cantidad;
  final String? link;
  final DateTime fechaCreacion;

  Product({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.peso,
    required this.precio,
    required this.cantidad,
    this.link,
    required this.fechaCreacion,
  });
}

