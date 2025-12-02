namespace LocalisationApi.Models;

public class UserAccount
{
    public int Id { get; set; }
    public string Nom { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "GR";
    public string DerniereConnexion { get; set; } = "";
    public string MotDePasse { get; set; } = "";
}
