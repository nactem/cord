package uk.ac.nactem.covid.network;

import java.util.List;

/**
 *
 * @author sam
 */
public interface TextSection {

    public String getSection();
    public List<CiteSpan> getCiteSpans();
}
