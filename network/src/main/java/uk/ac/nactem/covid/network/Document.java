package uk.ac.nactem.covid.network;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 *
 * @author sam
 */
public interface Document {

    public LocalDate getPublishTime();

    public List<TextSection> getAbstracts();

    public List<TextSection> getBodyText();

    public int getId();

    public String getTitle();
    
    public Map<String,BibEntry> getBibEntries();
}
